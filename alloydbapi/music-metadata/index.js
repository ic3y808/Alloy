var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const strtok3 = require("strtok3");
const Core = require("./core");
const MetadataCollector_1 = require("./common/MetadataCollector");
const ParserFactory_1 = require("./ParserFactory");
/**
 * Parse audio from Node Stream.Readable
 * @param {Stream.Readable} Stream to read the audio track from
 * @param {string} mimeType Content specification MIME-type, e.g.: 'audio/mpeg'
 * @param {IOptions} options Parsing options
 * @returns {Promise<IAudioMetadata>}
 */
function parseStream(stream, mimeType, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenizer = yield strtok3.fromStream(stream);
        return Core.parseFromTokenizer(tokenizer, mimeType, options);
    });
}
exports.parseStream = parseStream;
/**
 * Parse audio from Node Buffer
 * @param {Stream.Readable} stream Audio input stream
 * @param {string} mimeType <string> Content specification MIME-type, e.g.: 'audio/mpeg'
 * @param {IOptions} options Parsing options
 * @returns {Promise<IAudioMetadata>}
 * Ref: https://github.com/Borewit/strtok3/blob/e6938c81ff685074d5eb3064a11c0b03ca934c1d/src/index.ts#L15
 */
exports.parseBuffer = Core.parseBuffer;
/**
 * Parse audio from Node file
 * @param {string} filePath Media file to read meta-data from
 * @param {IOptions} options Parsing options
 * @returns {Promise<IAudioMetadata>}
 */
function parseFile(filePath, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileTokenizer = yield strtok3.fromFile(filePath);
        try {
            const parserName = ParserFactory_1.ParserFactory.getParserIdForExtension(filePath);
            if (parserName) {
                const parser = yield ParserFactory_1.ParserFactory.loadParser(parserName, options);
                const metadata = new MetadataCollector_1.MetadataCollector(options);
                yield parser.init(metadata, fileTokenizer, options).parse();
                return metadata.toCommonMetadata();
            }
            else {
                throw new Error('No parser found for extension: ' + Path.extname(filePath));
            }
        }
        finally {
            yield fileTokenizer.close();
        }
    });
}
exports.parseFile = parseFile;
/**
 * Create a dictionary ordered by their tag id (key)
 * @param {ITag[]} nativeTags list of tags
 * @returns {INativeTagDict} Tags indexed by id
 */
exports.orderTags = Core.orderTags;
/**
 * Convert rating to 1-5 star rating
 * @param {number} rating Normalized rating [0..1] (common.rating[n].rating)
 * @returns {number} Number of stars: 1, 2, 3, 4 or 5 stars
 */
exports.ratingToStars = Core.ratingToStars;
