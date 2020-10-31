const setDefaults = require('../_lib/setDefaults')
const Section = require('../02-section/Section')
const Document = require('./Document')

/**
 * @typedef DocumentToJsonOptions
 * @property {boolean | undefined} title
 * @property {boolean | undefined} pageID
 * @property {boolean | undefined} categories
 * @property {boolean | undefined} sections
 * @property {boolean | undefined} coordinates
 * @property {boolean | undefined} infoboxes
 * @property {boolean | undefined} images
 * @property {boolean | undefined} plaintext
 * @property {boolean | undefined} citations
 * @property {boolean | undefined} references
 */
const defaults = {
  title: true,
  pageID: true,
  categories: true,
  sections: true,
  coordinates: false,
  infoboxes:false,
  images: false,
  plaintext: false,
  citations: false,
  references: false
}

/**
 * @typedef documentToJsonReturn
 * @property {string | undefined} title
 * @property {number | null | undefined} pageID
 * @property {string[] | undefined} categories
 * @property {Section[] | undefined} sections
 * @property {boolean | undefined} isRedirect
 * @property {object | undefined} redirectTo
 * @property {Template[] | undefined} coordinates
 * @property {Infobox[] | undefined} infoboxes
 * @property {Image[] | undefined} images
 * @property {string | undefined} plaintext
 * @property {Reference[] | undefined} references
 */


/**
 * an opinionated output of the most-wanted data
 *
 * @private
 * @param {Document} doc
 * @param {DocumentToJsonOptions} options
 * @returns {documentToJsonReturn}
 */
const toJSON = function (doc, options) {
  options = setDefaults(options, defaults)

  /**
   * @type {documentToJsonReturn}
   */
  let data = {}

  if (options.title) {
    data.title = doc.title()
  }

  if (options.pageID) {
    data.pageID = doc.pageID()
  }

  if (options.categories) {
    data.categories = doc.categories()
  }

  if (options.sections) {
    data.sections = doc.sections().map((i) => i.json(options))
  }

  if (doc.isRedirect() === true) {
    data.isRedirect = true
    data.redirectTo = doc.redirectTo()
    data.sections = []
  }

  //these are default-off
  if (options.coordinates) {
    data.coordinates = doc.coordinates()
  }

  if (options.infoboxes) {
    data.infoboxes = doc.infoboxes().map((i) => i.json(options))
  }

  if (options.images) {
    data.images = doc.images().map((i) => i.json(options))
  }

  if (options.plaintext) {
    data.plaintext = doc.text(options)
  }

  if (options.citations || options.references) {
    data.references = doc.references()
  }

  return data
}
module.exports = toJSON
