import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";

import {
  selectSelectedProjectState,
  selectCreatedOptimsState,
  getOptimsThunk,
  updateProjectThunk,
  createOptimThunk,
} from "../../store";
import OptimInitContainer from "./optim-init-container";
import OptimSelectContainer from "./optim-select-container";
import makeStyles from "./optim-create-styles";
import useOptimSettingsState from "./hooks/optim-settings-hooks";
import useProjectUpdateState from "../../hooks/use-project-update-state";
import LoaderOverlay from "../../components/loader-overlay";

const useStyles = makeStyles();

function OptimCreateDialog({ open, handleClose, projectId }) {
  const [modalView, setModalView] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showError, setShowError] = useState(true);
  const classes = useStyles();
  const dispatch = useDispatch();
  const { pruning, setPruning } = useOptimSettingsState();
  const {
    changeValue,
    projectLoaded,
    projectSaving,
    values,
    saveValues,
    validationErrors,
  } = useProjectUpdateState(projectId);

  const createOptimState = useSelector(selectCreatedOptimsState);
  const selectedProjectState = useSelector(selectSelectedProjectState);

  if (
    selectedProjectState.status === "succeeded" &&
    selectedProjectState.val.project_id !== values.projectId
  ) {
    projectLoaded(selectedProjectState.val);
  }

  useEffect(() => {
    if (submitted && createOptimState.status === "succeeded") {
      setSubmitted(false);
      dispatch(getOptimsThunk({ projectId }));
      handleClose();
    }
  }, [submitted, createOptimState.status]);

  const onSubmit = () => {
    projectSaving();
    dispatch(
      updateProjectThunk({
        projectId,
        name: saveValues.name,
        description: saveValues.description,
        trainingOptimizer: saveValues.trainingOptimizer,
        trainingEpochs: saveValues.trainingEpochs,
        trainingLRInit: saveValues.trainingLRInit,
        trainingLRFinal: saveValues.trainingLRFinal,
      })
    );
    dispatch(
      createOptimThunk({
        projectId,
        add_pruning: pruning,
      })
    );
    setSubmitted(true);
    setShowError(true);
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setShowError(false);
        handleClose();
      }}
      PaperProps={{ className: classes.dialog }}
    >
      <div
        onClick={() => {
          if (createOptimState.error) {
            setShowError(false);
          }
        }}
      >
        <LoaderOverlay
          loading={createOptimState.status === "loading"}
          error={showError ? createOptimState.error : null}
        />
      </div>

      <DialogTitle>Model Optimization Settings</DialogTitle>
      {modalView === 0 && (
        <OptimInitContainer
          onCancel={() => handleClose()}
          onNext={() => setModalView(1)}
          pruning={pruning}
          setPruning={setPruning}
        />
      )}
      {modalView === 1 && (
        <OptimSelectContainer
          onCancel={() => handleClose()}
          onPrevious={() => setModalView(0)}
          optimizer={values.trainingOptimizer}
          optimizerValError={validationErrors.trainingOptimizer}
          optimizerOnChange={(e) => changeValue("trainingOptimizer", e.target.value)}
          epochs={values.trainingEpochs}
          epochsValError={validationErrors.trainingEpochs}
          epochsOnChange={(e) => changeValue("trainingEpochs", e.target.value)}
          initLR={values.trainingLRInit}
          initLRValError={validationErrors.trainingLRInit}
          initLROnChange={(e) => changeValue("trainingLRInit", e.target.value)}
          finalLR={values.trainingLRFinal}
          finalLRValError={validationErrors.trainingLRFinal}
          finalLROnChange={(e) => changeValue("trainingLRFinal", e.target.value)}
          onSubmit={() => onSubmit()}
        />
      )}
    </Dialog>
  );
}

OptimCreateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func,
  projectId: PropTypes.string.isRequired,
};

export default OptimCreateDialog;
