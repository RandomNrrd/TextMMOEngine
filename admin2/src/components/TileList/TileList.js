import React from 'react';
import { connect } from 'react-redux'; 

import lively from '../../services/lively';
import crud from '../../services/crud';

import { addTiles, selectTile } from '../../actions';
import { Paper, ExpansionPanel, ExpansionPanelSummary, Button, TextField, MenuItem, Typography, ExpansionPanelDetails, Input, List, ListItem, Avatar, ListItemText } from '@material-ui/core';

import { AddCircle } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

import WorldTile from '../WorldTile/WorldTile';

const styles = theme => ({
    root: {
        padding: 20
    },
    
    column: {
      flexBasis: '33.33%',
      flexShrink: 0
    },

    title: {
        marginBottom: theme.typography.pxToRem(20)
    },

    heading: {
      fontSize: theme.typography.pxToRem(15),
    },

    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    },

    textField: {
        width: '100%',
        marginBottom: 15
    },

    expansionPanelDetails: {
        flexWrap: 'wrap'
    },

    avatar: {
        backgroundColor: 'transparent',
        borderRadius: 0
    }
})

class TileList extends React.Component {
    state = { 
        tile: {
            name: 'Grass',
            material: 'Grass',
            type: 'Ground',
            energyCost: 1,
            traversable: 'Yes',
            rotation: 0,
            image: ''
        } 
    }

    constructor(props) {
        super(props);

        crud.findAll('tiles')
            .then(this.props.addTiles);

        lively.registerEvent("ADD_TILES", (state, action) => {
            state.tiles = state.tiles.concat(action.payload);

            return state;
        })

        lively.registerEvent("SELECT_TILE", (state, action) => {
            state.tile = action.payload;

            return state;
        })
    }

    handleTileChange(property, e) {
        this.setState({
            tile: {
                ...this.state.tile,

                [property]: e.target.value
            }
        })
    }

    createTile() {
        crud.create('tiles', { tile: this.state.tile })
            .then(tile => this.props.addTiles([tile]))
    }

    handleClick(tile) {
        this.props.selectTile(tile)
    }

    handleTileImageUpload(e) {
        e.persist();
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = e => {
            const result = e.target.result;

            this.setState({
                tile: {
                    ...this.state.tile,
                    image: result
                }
            });
        }

        reader.readAsDataURL(file);
    }

    render() {
        const { classes } = this.props;

        return (
            <Paper className={classes.root}>
                <Typography variant="title" className={classes.title}>Tiles</Typography>
                
                <ExpansionPanel>
                    <ExpansionPanelSummary>
                        <div className={classes.column}>
                            <Typography className={classes.heading}>
                                New Tile
                            </Typography>
                        </div>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                        <TextField
                            label="Name" 
                            className={classes.textField}
                            onChange={v => this.handleTileChange('name', v)}
                            value={this.state.tile.name}
                            helperText="Keep it recognizable and common"
                        />

                        <TextField
                            label="Material"
                            className={classes.textField}
                            onChange={v => this.handleTileChange('material', v)}
                            value={this.state.tile.material}
                            helperText="What is the tile made of?"
                        />

                        <TextField
                            label="Type"
                            className={classes.textField}
                            onChange={v => this.handleTileChange('type', v)}
                            value={this.state.tile.type}
                            helperText="Where is the tile placed?"
                        />

                        <TextField
                            label="Energy Cost"
                            type="number"
                            className={classes.textField}
                            onChange={v => this.handleTileChange('energyCost', v)}
                            value={this.state.tile.energyCost}
                            helperText="How much stamina will it take to traverse over?"
                        />

                        <TextField
                            label="Traversable"
                            select
                            className={classes.textField}
                            onChange={v => this.handleTileChange('traversable', v)}
                            value={this.state.tile.traversable}
                            helperText="Can we even walk over it?">

                            <MenuItem value="Yes">Yes</MenuItem>
                            <MenuItem value="No">No</MenuItem>
                        </TextField>

                        <TextField
                            multiline
                            label="HTML"
                            rowsMax="4"
                            value={this.state.tile.style}
                            onChange={e => this.handleTileChange('html', e)} 
                            className={classes.textField}
                            helperText="SVG code, HTML with inline styles, etc."
                        />

                        <TextField
                            label="Rotation"
                            type="number"
                            className={classes.textField}
                            onChange={v => this.handleTileChange('rotation', v)}
                            value={this.state.tile.rotation}
                            helperText="The tile will be rotated by this value * 90 degrees"
                        />

                        <input
                            type="file"
                            onChange={e => this.handleTileImageUpload(e)}
                            className={classes.textField}
                        />
                            
                        <Button variant="contained" color="primary" className={classes.button} onClick={() => this.createTile()}>
                            Save
                        </Button>
                    </ExpansionPanelDetails>
                </ExpansionPanel>

                <br/>
                 
                <List>
                    {this.props.tiles.map(tile => 
                        <ListItem button onClick={() => this.handleClick(tile)}>
                            <Avatar className={classes.avatar}>
                                <WorldTile worldTile={{ tileData: tile }} />
                            </Avatar>

                            <ListItemText primary={tile.name} secondary={tile.type} />
                        </ListItem>
                    )}
                </List>
            </Paper>
        )
    }
}

export default connect(
    state => ({
        tiles: state.tiles,
        tile: state.tile
    }),

    dispatch => ({
        addTiles: tiles => dispatch(addTiles(tiles)),
        selectTile: tile => dispatch(selectTile(tile))
    })
)(withStyles(styles)(TileList));