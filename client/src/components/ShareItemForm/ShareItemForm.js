import React, { Component } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import styles from "./styles";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { Form, Field, FormSpy } from "react-final-form";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import {
  updateItem,
  resetItem,
  resetItemImage
} from "../../redux/ShareItemPreviewReducer/reducer";
import { connect } from "react-redux";
import PropTypes from "prop-types";
class ShareItemForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileSelected: false,
      // if returns true its going to reset the form
      done: false,
      selectedTags: []
    };
    // images
    this.fileInput = React.createRef();
  }
  onSubmit(formState) {}
  validate(formState) {}

  // encrypts the image into a string
  getBase64Url() {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        resolve(
          `data:${this.state.fileSelected.type};base64, ${btoa(
            e.target.result
          )}`
        );
      };
      reader.readAsBinaryString(this.state.fileSelected);
    });
  }

  // gets called from dispatchUpdate function
  // picks selected tag containing array which is an object containing title and id
  applyTags(tags) {
    return (
      tags &&
      tags
        .filter(t => this.state.selectedTags.indexOf(t.id) > -1)
        .map(t => ({ title: t.title, id: t.id }))
    );
  }

  // calls updateItem prop that dispatches action so that the preview gets updated
  dispatchUpdate(values, tags, updateItem) {
    if (!values.imageurl && this.state.fileSelected) {
      this.getBase64Url().then(imageurl => {
        updateItem({
          imageurl
        });
      });
    }
    updateItem({
      ...values
      // tags: this.applyTags(tags)
    });
  }

  handleSelectTag(event) {
    this.setState({ selectedTags: event.target.value });
  }

  generateTagsText(tags, selected) {
    return tags
      .map(t => (selected.indexOf(t.id) > -1 ? t.title : false))
      .filter(e => e)
      .join(", ");
  }

  handleSelectFile(event) {
    this.setState({
      fileSelected: this.fileInput.current.files[0]
    });
  }

  resetFileInput() {
    this.props.resetItemImage();
    this.fileInput.current.value = "";
    this.setState({ fileSelected: false });
  }

  render() {
    const { tags, classes, updateItem } = this.props;
    console.log(updateItem);
    return (
      // add refetch queries
      <Card>
        <CardContent>
          <Form
            validate={formState => this.validate(formState)}
            onSubmit={formState => this.onSubmit(formState)}
            render={({ handleSubmit, pristine, invalid }) => (
              <form onSubmit={handleSubmit}>
                <FormSpy
                  subscription={{ values: true }}
                  component={({ values }) => {
                    if (values) {
                      this.dispatchUpdate(values, tags, updateItem);
                    }
                    return "";
                  }}
                />
                <h1>Share. Borrow. Prosper.</h1>
                <FormControl fullWidth className={classes.formControl}>
                  <Field name="imageurl">
                    {({ input, meta }) => {
                      return (
                        <React.Fragment>
                          {!this.state.fileSelected ? (
                            <Button
                              size="medium"
                              color="primary"
                              variant="contained"
                              onClick={() => {
                                this.fileInput.current.click();
                              }}
                            >
                              <p className={classes.imagebuttontext}>
                                Select an Image
                              </p>
                            </Button>
                          ) : (
                            <Button
                              size="medium"
                              color="primary"
                              variant="outlined"
                              onClick={() => {
                                this.resetFileInput();
                              }}
                            >
                              <Typography>Reset image</Typography>
                            </Button>
                          )}
                          <input
                            ref={this.fileInput}
                            hidden
                            type="file"
                            accept="image/*"
                            id="fileInput"
                            onChange={e => this.handleSelectFile(e)}
                          />
                        </React.Fragment>
                      );
                    }}
                  </Field>
                </FormControl>

                <div>
                  <Field
                    name="name"
                    render={({ input, meta }) => (
                      <label>
                        <TextField
                          id="description"
                          inputProps={{ ...input }}
                          label="Describe your Item"
                          value={input.value}
                          margin="normal"
                          className={classes.inputfield}
                        />
                      </label>
                    )}
                  />
                </div>

                <div>
                  <Field
                    name="describe"
                    render={({ input, meta }) => (
                      <label>
                        <TextField
                          id="standard-name"
                          inputProps={{ ...input }}
                          label="Describe your Item"
                          value={input.value}
                          margin="normal"
                          className={classes.inputfield}
                        />
                      </label>
                    )}
                  />
                </div>
                <div>
                  <FormControl fullWidth className={classes.formControl}>
                    <InputLabel htmlFor="tags">Add some tags</InputLabel>
                    <Field name="tags">
                      {({ input, meta }) => {
                        return (
                          <Select
                            multiple
                            value={this.state.selectedTags}
                            onChange={e => this.handleSelectTag(e)}
                            renderValue={selected => {
                              return this.generateTagsText(tags, selected);
                            }}
                          >
                            {tags &&
                              tags.map(tag => (
                                <MenuItem key={tag.id} value={tag.id}>
                                  <Checkbox
                                    checked={
                                      this.state.selectedTags.indexOf(tag.id) >
                                      -1
                                    }
                                  />
                                  <ListItemText primary={tag.title} />
                                </MenuItem>
                              ))}
                          </Select>
                        );
                      }}
                    </Field>
                  </FormControl>
                  <FormControl>
                    <InputLabel htmlFor="demo-controlled-open-select">
                      Add Some Tags
                    </InputLabel>
                    <Select>
                      {/* TODO get tags for menu */}
                      <MenuItem value={10} className={classes.inputfield} />
                    </Select>
                  </FormControl>
                </div>
                <Button variant="contained">Share</Button>
              </form>
            )}
          />
        </CardContent>
      </Card>
    );
  }
}

ShareItemForm.propTypes = {
  tags: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired,
  updateItem: PropTypes.func.isRequired
};

// converts dispatch functions into props
const mapDispatchToProps = dispatch => ({
  updateItem(item) {
    dispatch(updateItem(item));
  },
  resetItem() {
    dispatch(resetItem());
  },
  resetItemImage() {
    dispatch(resetItemImage());
  }
});
export default connect(
  null,
  mapDispatchToProps
)(withStyles(styles)(ShareItemForm));
