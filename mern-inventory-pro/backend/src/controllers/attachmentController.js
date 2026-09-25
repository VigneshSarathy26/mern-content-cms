const Attachment = require('../models/Attachment');
const logger = require('../config/logger');

// @desc    Get attached document specifications & invoices
// @route   GET /api/attachments
const getAttachments = async (req, res) => {
  try {
    const { relatedType, relatedId } = req.query;
    let query = {};
    if (relatedType) query.relatedType = relatedType;
    if (relatedId) query.relatedId = relatedId;

    const attachments = await Attachment.find(query).sort({ createdAt: -1 });
    return res.json(attachments);
  } catch (error) {
    logger.error(`Get Attachments Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to fetch document attachments' });
  }
};

// @desc    Upload product spec or supplier invoice document
// @route   POST /api/attachments
const uploadAttachment = async (req, res) => {
  try {
    const { fileName, fileType, relatedType, relatedId, fileUrl, fileSize } = req.body;

    const attachment = await Attachment.create({
      fileName: fileName || 'document.pdf',
      fileType: fileType || 'application/pdf',
      relatedType: relatedType || 'GENERAL',
      relatedId: relatedId || null,
      fileUrl: fileUrl || 'https://storage.azure.blob.core.windows.net/documents/mock_doc.pdf',
      fileSize: Number(fileSize) || 1024,
    });

    logger.info(`[ATTACHMENT STORED] Document attached: ${attachment.fileName}`);
    return res.status(201).json(attachment);
  } catch (error) {
    logger.error(`Upload Attachment Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to record attachment' });
  }
};

module.exports = { getAttachments, uploadAttachment };
