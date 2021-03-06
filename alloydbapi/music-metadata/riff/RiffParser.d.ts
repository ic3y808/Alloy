import { IChunkHeader } from '../aiff/Chunk';
import { BasicParser } from '../common/BasicParser';
/**
 * Resource Interchange File Format (RIFF) Parser
 *
 * WAVE PCM soundfile format
 *
 * Ref:
 *  http://www.johnloomis.org/cpe102/asgn/asgn1/riff.html
 *  http://soundfile.sapp.org/doc/WaveFormat
 *
 *  ToDo: Split WAVE part from RIFF parser
 */
export declare class WavePcmParser extends BasicParser {
    private fact;
    private blockAlign;
    private header;
    parse(): Promise<void>;
    parseRiffChunk(): Promise<void>;
    readWaveChunk(): Promise<void>;
    parseListTag(listHeader: IChunkHeader): Promise<void>;
    private parseRiffInfoTags;
    private addTag;
}
