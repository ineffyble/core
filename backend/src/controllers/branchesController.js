'use strict';

const uuid = require('node-uuid');
const branchService = require('../services/branchService');
const logger = require('../lib/logger');
const adminType = require('../security/adminType');
const validator = require('../lib/inputValidator');
const branchValidator = require('../lib/branchValidator');
const streamClient = require('../streamClient');

function listBranches(req, res) {
  return branchService.list(['id', 'name'])
    .then(branches => res.status(200).json({ branches }))
    .catch(() => res.sendStatus(500));
}

function parseBranch(req) {
  const branch = { id: req.body.id };
  if (req.body.name !== undefined) {
    branch.name = req.body.name;
  }
  if (req.body.notes !== undefined) {
    branch.notes = req.body.notes;
  }
  if (req.body.contact !== undefined) {
    branch.contact = req.body.contact;
  }
  return branch;
}

function deleteBranch(req, res) {
  const branchId = req.params.branchId;

  if (!(validator.isValidUUID(branchId))) {
    logger.error(`Failed deleting the admin with branchId: ${branchId}`);
    return res.sendStatus(400);
  }

  return branchService.delete(branchId)
    .then(() => {
      res.sendStatus(200);
    })
    .catch(error => {
      logger.error(`Failed deleting the admin with branchId: ${branchId}}`, error);
      res.sendStatus(500);
    });
}

function createBranch(req, res) {
  const branch = {
    id: uuid.v4(),
    name: req.body.name,
    notes: req.body.notes,
    contact: req.body.contact,
  };
  const validationErrors = branchValidator.isValid(branch);

  if (validationErrors.length > 0) {
    logger.info('[create-new-branch-validation-error]', { errors: validationErrors });
    return res.status(400).json({ errors: validationErrors });
  }

  return streamClient.publish('branch-created', branch)
    .then(() => res.status(200).json(branch))
    .catch(error => {
      logger.error('Failed creating a new branch', error);
      return res.status(500);
    });
}

function updateBranch(req, res) {
  const branch = parseBranch(req);

  if (!branch.id || branch.id !== req.params.branchId) {
    logger.info('[update-branch-validation-error]', { errors: ['invalid params'] });
    return res.status(400).json({ errors: ['invalid params'] });
  }

  const validationErrors = branchValidator.isValid(branch);
  if (validationErrors.length > 0) {
    logger.info('[update-branch-validation-error]', { errors: validationErrors });
    return res.status(400).json({ errors: validationErrors });
  }

  return branchService.update(branch)
    .then(updatedBranch => res.status(200).json(updatedBranch))
    .catch(error => {
      logger.error(`Failed updating the branch id:${branch.id}`, error);
      res.status(500);
    });
}

function findBranches(admin) {
  if (admin.type === adminType.super) {
    return branchService.list();
  }

  return branchService.findById(admin.branchId)
    .then(result => {
      delete result.notes;
      return [result];
    });
}

function branchesForAdmin(req, res) {
  return findBranches(req.user)
    .then(result => res.status(200).json({ branches: result }))
    .catch(() => {
      logger.error('[branches-for-admin]', `Error when retrieving branches for user: ${req.user ? req.user.email : 'unknown'}`);
      res.sendStatus(500);
    });
}

module.exports = {
  listBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  branchesForAdmin,
};
