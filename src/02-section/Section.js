//@ts-expect-error because this is some kind of type definition for jsdoc that's why typescript does not recognize it
const Document = require('../01-document/Document')
const toJSON = require('./toJson')
const setDefaults = require('../_lib/setDefaults')

const parse = {
  heading: require('./heading'),
  table: require('../table'),
  paragraphs: require('../03-paragraph'),
  templates: require('../template'),
  references: require('../reference'),
  startEndTemplates: require('./start-to-end'),
}

const defaults = {
  tables: true,
  references: true,
  paragraphs: true,
  templates: true,
  infoboxes: true,
}

/**
 * @class
 */
class Section {
  /**
   * the stuff between headings - 'History' section for example
   *
   * @param {object} data the data already gathered about the section
   * @param {Document} doc the document that this section belongs to
   */
  constructor(data, doc) {
    /**
     *
     * @private
     * @type {Document|null}
     */
    this._doc = doc || null

    this._title = data.title || ''
    this._depth = data.depth
    this._wiki = data.wiki || ''
    this._templates = []
    this._tables = []
    this._infoboxes = []
    this._references = []
    this._paragraphs = []

    //parse-out <template></template>' and {{start}}...{{end}} templates
    const startEndTemplates = parse.startEndTemplates(this, doc)
    this._wiki = startEndTemplates.text
    this._templates = [...this._templates, ...startEndTemplates.templates]

    //parse-out the <ref></ref> tags
    parse.references(this)
    //parse-out all {{templates}}
    parse.templates(this, doc)

    //parse the tables
    parse.table(this)

    //now parse all double-newlines
    parse.paragraphs(this, doc)
  }

  /**
   * returns the title of a section. if no title is available then it returns empty string
   *
   * @returns {string} the title of the section
   */
  title() {
    return this._title || ''
  }

  /**
   * returns the index of the current section in the document
   *
   * @returns {number | null} the index of the current section in the document
   */
  index() {
    if (!this._doc) {
      return null
    }
    let index = this._doc.sections().indexOf(this)
    if (index === -1) {
      return null
    }
    return index
  }

  /**
   * returns the depth (or indentation) of the section
   * aka how many levels deep is this section located
   *
   * @returns {number} the depth of the section
   */
  depth() {
    return this._depth
  }

  /**
   * returns the depth (or indentation) of the section
   * aka how many levels deep is this section located
   *
   * @returns {number} the depth of the section
   */
  indentation() {
    return this.depth()
  }

  /**
   * returns all sentences in the section
   * if an clue is provided then it returns the sentence at clue-th index
   *
   * @param {number} [clue] the clue for selecting the sentence
   * @returns {Sentence | Sentence[]} all sentences in an array or the clue-th sentence
   */
  sentences(clue) {
    let arr = this.paragraphs().reduce((list, p) => {
      return list.concat(p.sentences())
    }, [])
    if (typeof clue === 'number') {
      return arr[clue]
    }
    return arr || []
  }

  /**
   * returns all paragraphs in the section
   * if an clue is provided then it returns the paragraph at clue-th index
   *
   * @param {number} [clue] the clue for selecting the paragraph
   * @returns {Paragraph | Paragraph[]} all paragraphs in an array or the clue-th paragraph
   */
  paragraphs(clue) {
    let arr = this._paragraphs || []
    if (typeof clue === 'number') {
      return arr[clue]
    }
    return arr || []
  }

  /**
   * returns all paragraphs in the section
   * if an clue is provided then it returns the paragraph at clue-th index
   *
   * @param {number} [clue] the clue for selecting the paragraph
   * @returns {Paragraph | Paragraph[]} all paragraphs in an array or the clue-th paragraph
   */
  paragraph(clue) {
    let arr = this._paragraphs || []
    if (typeof clue === 'number') {
      return arr[clue]
    }
    return arr[0]
  }

  /**
   * returns all links in the section
   * if an clue is provided and it is a number then it returns the link at clue-th index
   * if an clue is provided and it is a string then it returns the link at the that content
   *
   * @param {number| string} [clue] the clue for selecting the link
   * @returns {Link | Link[]} all links in an array or the clue-th link or the link with the content of clue
   */
  links(clue) {
    let arr = []

    this.infoboxes().forEach((templ) => {
      arr.push(templ.links())
    })

    this.sentences().forEach((s) => {
      arr.push(s.links())
    })

    this.tables().forEach((t) => {
      arr.push(t.links())
    })

    this.lists().forEach((list) => {
      arr.push(list.links())
    })

    arr = arr
      .reduce((acc, val) => acc.concat(val), []) //flatten the array
      .filter((val) => val !== undefined) //filter out all the undefined from the flattened empty arrays

    if (typeof clue === 'number') {
      return arr[clue]
    }

    if (typeof clue === 'string') {
      let link = arr.find(o => o.page().toLowerCase() === clue.toLowerCase())
      return link === undefined ? [] : [link]
    }

    return arr
  }

  /**
   * returns all infoboxes in the section
   * if an clue is provided then it returns the infobox at clue-th index
   *
   * @param {number} [clue] the clue for selecting the infobox
   * @returns {Infobox | Infobox[]} all infoboxes in an array or the clue-th infobox
   */
  tables(clue) {
    let arr = this._tables || []
    if (typeof clue === 'number') {
      return arr[clue]
    }
    return arr
  }

  /**
   * returns all templates in the section
   * if an clue is provided and clue is a number then it returns the template at clue-th index
   * if an clue is provided and clue is a string then it returns all template with that name
   *
   * @param {number|string} [clue] the clue for selecting the template
   * @returns {Template | Template[]} all templates in an array or the clue-th template or all template name `clue`
   */
  templates(clue) {
    let arr = this._templates || []
    arr = arr.map(t => t.json())

    if (typeof clue === 'number') {
      return arr[clue]
    }

    if (typeof clue === 'string') {
      clue = clue.toLowerCase()
      return arr.filter((o) => o.template === clue || o.name === clue)
    }

    return arr
  }

  /**
   * returns all infoboxes in the section
   * if an clue is provided then it returns the infobox at clue-th index
   *
   * @param {number} [clue] the clue for selecting the infobox
   * @returns {Infobox | Infobox[]} all infoboxes in an array or the clue-th infobox
   */
  infoboxes(clue) {
    let arr = this._infoboxes || []
    if (typeof clue === 'number') {
      return arr[clue]
    }
    return arr
  }

  /**
   * returns all lists in the section
   * if an clue is provided then it returns the list at clue-th index
   *
   * @param {number} [clue] the clue for selecting the list
   * @returns {Link | Link[]} all lists in an array or the clue-th list
   */
  coordinates(clue) {
    let arr = [...this.templates('coord'), ...this.templates('coor')]
    if (typeof clue === 'number') {
      if (!arr[clue]) {
        return []
      }
      return arr[clue]
    }
    return arr
  }

  /**
   * returns all lists in the section
   * if an clue is provided then it returns the list at clue-th index
   *
   * @param {number} [clue] the clue for selecting the list
   * @returns {Link | Link[]} all lists in an array or the clue-th list
   */
  lists(clue) {
    let arr = []
    this.paragraphs().forEach((p) => {
      arr = arr.concat(p.lists())
    })
    if (typeof clue === 'number') {
      return arr[clue]
    }
    return arr
  }

  /**
   * returns all interwiki links in the section
   * if an clue is provided then it returns the interwiki link at clue-th index
   *
   * @param {number} [clue] the clue for selecting the interwiki link
   * @returns {Link | Link[]} all interwiki links in an array or the clue-th interwiki link
   */
  interwiki(clue) {
    let arr = []
    this.paragraphs().forEach((p) => {
      arr = arr.concat(p.interwiki())
    })
    if (typeof clue === 'number') {
      return arr[clue]
    }
    return arr || []
  }

  /**
   * returns all images in the section
   * if an clue is provided then it returns the image at clue-th index
   *
   * @param {number} [clue] the clue for selecting the reference
   * @returns {Image | Image[]} all images in an array or the clue-th image
   */
  images(clue) {
    let arr = []
    this.paragraphs().forEach((p) => {
      arr = arr.concat(p.images())
    })
    if (typeof clue === 'number') {
      return arr[clue]
    }
    return arr || []
  }

  /**
   * returns all references in the section
   * if an clue is provided then it returns the reference at clue-th index
   *
   * @param {number} [clue] the clue for selecting the reference
   * @returns {Reference | Reference[]} all references in an array or the clue-th reference
   */
  references(clue) {
    let arr = this._references || []
    if (typeof clue === 'number') {
      return arr[clue]
    }
    return arr
  }

  /**
   * returns all references in the section
   * if an clue is provided then it returns the reference at clue-th index
   *
   * @param {number} [clue] the clue for selecting the reference
   * @returns {Reference | Reference[]} all references in an array or the clue-th reference
   */
  citations(clue) {
    return this.references(clue)
  }

  //transformations
  /**
   * Removes the section from the document
   *
   * @returns {null|Document} the document without this section. or null if there is no document
   */
  remove() {
    if (!this._doc) {
      return null
    }

    let bads = {}
    bads[this.title()] = true

    //remove children too
    this.children().forEach((sec) => (bads[sec.title()] = true))
    let sections = this._doc.sections()
    sections = sections.filter((sec) => bads.hasOwnProperty(sec.title()) !== true)
    sections = sections.filter(sec => bads.hasOwnProperty(sec.title()) !== true)

    this._doc._sections = sections
    return this._doc
  }

  //move-around sections like in jquery
  /**
   * returns the next sibling of this section
   * if it can find one then it returns null
   *
   * @returns {Section|null} the next sibling
   */
  nextSibling() {
    //if this section is not part of a document then we can go to the next part of the document
    if (!this._doc) {
      return null
    }

    //first we get the a list of sections and our own position in this list
    let sections = this._doc.sections()
    let index = this.index()

    //then we look trough the list looking for the next sibling
    //aka we look the next item at the same depth as us
    //so we start the loop at the next section in the list and go till the length of the list
    for (let i = index + 1; i < sections.length; i++) {
      //if the depth is smaller then the current depth then there is no next sibling
      //aka the depth of the section at position i a level higher then this section then this section is the last section at this depth
      if (sections[i].depth() < this.depth()) {
        return null
      }
      //if the section has the same depth as the current section then it is the next sibling
      if (sections[i].depth() === this.depth()) {
        return sections[i]
      }
    }
    //if the loop has no results then there is no next sibling and we are at the end of the file
    return null
  }

  /**
   * returns the next sibling of this section
   * if it can find one then it returns null
   *
   * @returns {Section|null} the next sibling
   */
  next() {
    return this.nextSibling()
  }

  /**
   * returns the previous section
   *
   * @returns {Section|null} the previous section
   */
  lastSibling() {
    if (!this._doc) {
      return null
    }
    let sections = this._doc.sections()
    let index = this.index()
    return sections[index - 1] || null
  }

  /**
   * returns the previous section
   *
   * @returns {Section|null} the previous section
   */
  last() {
    return this.lastSibling()
  }

  /**
   * returns the previous section
   *
   * @returns {Section|null} the previous section
   */
  previousSibling() {
    return this.lastSibling()
  }

  /**
   * returns the previous section
   *
   * @returns {Section|null} the previous section
   */
  previous() {
    return this.lastSibling()
  }

  /**
   * returns all the children of a section
   *
   * If the clue is a string then it will return the child with that exact title
   * Else if the clue is a number then it returns the child at that index
   * Else it returns all the children
   *
   * @param {number | string} [clue] A title of a section or a index of a wanted section
   * @returns {Section | Section[] | null} A section or a array of sections
   */
  children(clue) {
    if (!this._doc) {
      return null
    }

    let sections = this._doc.sections()
    let index = this.index()
    let children = []

    //(immediately preceding sections with higher depth)
    if (sections[index + 1] && sections[index + 1].depth() > this.depth()) {
      for (let i = index + 1; i < sections.length; i += 1) {
        if (sections[i].depth() > this.depth()) {
          children.push(sections[i])
        } else {
          break
        }
      }
    }

    if (typeof clue === 'string') {
      return children.find(s => s.title().toLowerCase() === clue.toLowerCase())
    }

    if (typeof clue === 'number') {
      return children[clue]
    }

    return children
  }

  /**
   * returns all the children of a section
   *
   * If the clue is a string then it will return the child with that exact title
   * Else if the clue is a number then it returns the child at that index
   * Else it returns all the children
   *
   * @param {number | string} [clue] A title of a section or a index of a wanted section
   * @returns {Section | Section[] | null} A section or a array of sections
   */
  sections(clue) {
    return this.children(clue)
  }

  /**
   * returns all the parent of a section
   *
   * @returns {Section | null} A section that is the parent of a section
   */
  parent() {
    if (!this._doc) {
      return null
    }
    let sections = this._doc.sections()
    let index = this.index()

    for (let i = index; i >= 0; i -= 1) {
      if (sections[i] && sections[i].depth() < this.depth()) {
        return sections[i]
      }
    }

    return null
  }

  //outputs

  /**
   * returns a plaintext version of the section
   *
   * @param options options for the text transformation
   * @returns {string} the section in text
   */
  text(options) {
    options = setDefaults(options, defaults)

    return this
      .paragraphs()
      .map(p => p.text(options))
      .join('\n\n')
  }

  /**
   * returns a json version of the section
   *
   * @param {sectionToJsonOptions} options keys to include in the resulting json
   * @returns {object} the section in json
   */
  json(options) {
    options = setDefaults(options, defaults)
    return toJSON(this, options)
  }

  /**
   * this function removes the circular nature of including the document in the sections
   *
   * @private
   * @returns {object} the section without this._doc
   */
  toJSON() {
    return Object.entries(this)
      .filter((entry) => entry[0] !== '_doc')
      .reduce((accum, [k, v]) => {
        accum[k] = v
        return accum
      }, {})
  }
}

module.exports = Section
