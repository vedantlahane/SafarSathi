"""
GPU utility functions for LightGBM training.
"""

import logging

logger = logging.getLogger(__name__)


def get_lgbm_gpu_params() -> dict:
    """
    Get standard GPU parameters for LightGBM.
    
    Returns a dict with gpu acceleration flags.
    These should be merged into your params dict before training.
    """
    return {
        "device": "gpu",
        "device_type": "gpu",
    }


def validate_lgbm_params(params: dict, model_name: str = "model") -> dict:
    """
    Validate and log LightGBM training parameters.
    
    Ensures GPU parameters are present and logs them for debugging.
    """
    # Ensure GPU params are set
    if "device" not in params:
        params["device"] = "gpu"
    if "device_type" not in params:
        params["device_type"] = "gpu"
    
    # Log important params for debugging
    logger.info(f"\n{'='*60}")
    logger.info(f"  {model_name.upper()} TRAINING PARAMETERS")
    logger.info(f"{'='*60}")
    logger.info(f"  Objective:    {params.get('objective', 'N/A')}")
    logger.info(f"  Learning Rate: {params.get('learning_rate', 'N/A')}")
    logger.info(f"  Device:       {params.get('device', 'N/A')} (GPU={params.get('device') == 'gpu'})")
    logger.info(f"  Device Type:  {params.get('device_type', 'N/A')}")
    logger.info(f"  Num Leaves:   {params.get('num_leaves', 'N/A')}")
    logger.info(f"  Max Depth:    {params.get('max_depth', 'N/A')}")
    logger.info(f"{'='*60}\n")
    
    return params
