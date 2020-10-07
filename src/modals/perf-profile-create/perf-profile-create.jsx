import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Typography,
  InputLabel,
} from "@material-ui/core";
import _ from "lodash";

import {
  selectSystemState,
  getSystemInfoThunk,
  getProfilesPerfThunk,
  STATUS_FAILED,
  STATUS_LOADING,
  STATUS_SUCCEEDED,
  clearCreatePerfProfile,
  createPerfProfileThunk,
  cancelAndDeletePerfProfileThunk,
  selectCreatePerfProfile,
  STATUS_IDLE,
} from "../../store";
import makeStyles from "./perf-profile-create-styles";
import LoaderLayout from "../../components/loader-layout";
import FadeTransitionGroup from "../../components/fade-transition-group";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles();

function PerfProfileCreateDialog({ open, handleClose, projectId }) {
  const systemInfoState = useSelector(selectSystemState);
  const dispatch = useDispatch();
  const history = useHistory();
  const classes = useStyles();

  const [closing, setClosing] = useState(false);
  const [name, setName] = useState("");
  const [batchSize, setBatchSize] = useState(1);
  const [numCores, setNumCores] = useState(1);

  const createPerfProfileState = useSelector(selectCreatePerfProfile);
  const profiling =
    createPerfProfileState.status === STATUS_LOADING ||
    createPerfProfileState.status === STATUS_FAILED;

  const canceling = createPerfProfileState.cancelingStatus === STATUS_LOADING;

  const action =
    createPerfProfileState.status === STATUS_SUCCEEDED ? "Completed" : "Add";

  let profilingLabel = "Profiling Performance";
  if (canceling || createPerfProfileState.status === STATUS_SUCCEEDED) {
    profilingLabel = "Canceling";
  } else if (createPerfProfileState.error) {
    profilingLabel = "";
  }

  const available_instructions = _.get(systemInfoState, "val.available_instructions");

  const nmEngineAvailable =
    systemInfoState.val && systemInfoState.val.available_engines
      ? systemInfoState.val.available_engines.indexOf("neural_magic") > -1
      : false;

  const handleClear = () => {
    dispatch(clearCreatePerfProfile());
    setName("");
    setBatchSize(1);
    setNumCores(1);
  };

  // Will wait until canceling is finished before closing
  useEffect(() => {
    if (
      createPerfProfileState.cancelingStatus === STATUS_SUCCEEDED &&
      createPerfProfileState.status !== STATUS_LOADING &&
      closing
    ) {
      handleClose();
      handleClear();
    }
  }, [createPerfProfileState, closing]);

  const handleCancel = () => {
    if (createPerfProfileState.val) {
      dispatch(
        cancelAndDeletePerfProfileThunk({
          projectId,
          profileId: createPerfProfileState.profileId,
        })
      );
      setClosing(true);
    } else {
      handleClose();
      handleClear();
    }
  };

  const handleAction = () => {
    const completed = createPerfProfileState.status === STATUS_SUCCEEDED;
    if (!createPerfProfileState.error && !profiling && !completed) {
      dispatch(
        createPerfProfileThunk({
          projectId,
          name,
          batchSize,
          numCores,
        })
      );
    } else if (completed) {
      history.push(`/project/${projectId}/perf/${createPerfProfileState.profileId}`);

      handleClear();
      dispatch(
        getProfilesPerfThunk({
          projectId,
        })
      );
      handleClose();
    } else if (createPerfProfileState.error) {
      if (createPerfProfileState.val) {
        dispatch(
          cancelAndDeletePerfProfileThunk({
            projectId,
            profileId: createPerfProfileState.profileId,
          })
        );
      }
      handleClear();
    }
  };

  useEffect(() => {
    if (open) {
      dispatch(getSystemInfoThunk());
    }
  }, [open, dispatch]);

  return (
    <Dialog
      aria-labelledby="profile-perf-create-dialog-title"
      fullWidth={true}
      maxWidth="md"
      open={open}
      PaperProps={{ className: classes.dialog }}
    >
      <div className={classes.root}>
        <DialogTitle>New Performance Profile</DialogTitle>
        <DialogContent classes={{ root: classes.dialogContent }}>
          <FadeTransitionGroup
            className={classes.transitionGroup}
            showIndex={profiling || canceling ? 1 : 0}
          >
            <div>
              <Typography>Measure the model's performace</Typography>
              {nmEngineAvailable && (
                <Grid className={classes.profileBody} container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      id="name"
                      variant="outlined"
                      type="text"
                      fullWidth
                      label="Performance Profile Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      id="batchSize"
                      variant="outlined"
                      type="number"
                      label="Batch Size"
                      value={batchSize}
                      onChange={(e) => setBatchSize(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      id="numCores"
                      variant="outlined"
                      type="number"
                      label="CPU Cores"
                      value={numCores !== null ? numCores : ""}
                      onChange={(e) => setNumCores(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <InputLabel className={classes.textLabel}>
                      Instruction Sets
                    </InputLabel>

                    <Typography>
                      {available_instructions
                        ? available_instructions.join(", ")
                        : available_instructions}
                    </Typography>
                  </Grid>
                </Grid>
              )}
              {!nmEngineAvailable && (
                <div className={classes.profileBody}>
                  <Typography variant="subtitle2" color="error">
                    The neuralmagic package must be installed for CPU performance
                    profiling
                  </Typography>
                </div>
              )}
            </div>

            <div className={classes.loaderContainer}>
              <LoaderLayout
                loading={createPerfProfileState.status === STATUS_LOADING || canceling}
                progress={!canceling ? createPerfProfileState.progressValue : null}
                error={createPerfProfileState.error}
              />
              <Typography
                variant="body1"
                color="textPrimary"
                className={classes.loaderText}
              >
                {profilingLabel}
              </Typography>
              {createPerfProfileState.error && (
                <Button onClick={handleAction}>Clear</Button>
              )}
            </div>
          </FadeTransitionGroup>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancel}
            className={classes.cancelButton}
            disabled={canceling}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            color="secondary"
            variant="contained"
            disableElevation
            disabled={profiling}
          >
            {action}
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}

PerfProfileCreateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func,
  projectId: PropTypes.string.isRequired,
};

export default PerfProfileCreateDialog;