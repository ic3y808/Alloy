var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Token = require("token-types");
const Util_1 = require("../../common/Util");
const initDebug = require("debug");
const debug = initDebug('music-metadata:parser:musepack:sv8');
const PacketKey = new Token.StringType(2, 'binary');
/**
 * Stream Header Packet part 1
 * Ref: http://trac.musepack.net/musepack/wiki/SV8Specification#StreamHeaderPacket
 */
const SH_part1 = {
    len: 5,
    get: (buf, off) => {
        return {
            crc: Token.UINT32_LE.get(buf, off),
            streamVersion: Token.UINT8.get(buf, off + 4)
        };
    }
};
/**
 * Stream Header Packet part 3
 * Ref: http://trac.musepack.net/musepack/wiki/SV8Specification#StreamHeaderPacket
 */
const SH_part3 = {
    len: 2,
    get: (buf, off) => {
        return {
            sampleFrequency: [44100, 48000, 37800, 32000][Util_1.default.getBitAllignedNumber(buf, off, 0, 3)],
            maxUsedBands: Util_1.default.getBitAllignedNumber(buf, off, 3, 5),
            channelCount: Util_1.default.getBitAllignedNumber(buf, off + 1, 0, 4) + 1,
            msUsed: Util_1.default.isBitSet(buf, off + 1, 4),
            audioBlockFrames: Util_1.default.getBitAllignedNumber(buf, off + 1, 5, 3)
        };
    }
};
class StreamReader {
    constructor(tokenizer) {
        this.tokenizer = tokenizer;
    }
    readPacketHeader() {
        return __awaiter(this, void 0, void 0, function* () {
            const key = yield this.tokenizer.readToken(PacketKey);
            const size = yield this.readVariableSizeField();
            return {
                key,
                payloadLength: size.value - 2 - size.len
            };
        });
    }
    readStreamHeader(size) {
        return __awaiter(this, void 0, void 0, function* () {
            const streamHeader = {};
            debug(`Reading SH at offset=${this.tokenizer.position}`);
            const part1 = yield this.tokenizer.readToken(SH_part1);
            size -= SH_part1.len;
            Object.assign(streamHeader, part1);
            debug(`SH.streamVersion = ${part1.streamVersion}`);
            const sampleCount = yield this.readVariableSizeField();
            size -= sampleCount.len;
            streamHeader.sampleCount = sampleCount.value;
            const bs = yield this.readVariableSizeField();
            size -= bs.len;
            streamHeader.beginningOfSilence = bs.value;
            const part3 = yield this.tokenizer.readToken(SH_part3);
            size -= SH_part3.len;
            Object.assign(streamHeader, part3);
            // assert.equal(size, 0);
            yield this.tokenizer.ignore(size);
            return streamHeader;
        });
    }
    readVariableSizeField(len = 1, hb = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let n = yield this.tokenizer.readToken(Token.UINT8);
            if ((n & 0x80) === 0) {
                return { len, value: hb + n };
            }
            n &= 0x7F;
            n += hb;
            return this.readVariableSizeField(len + 1, n << 7);
        });
    }
}
exports.StreamReader = StreamReader;
