/// <reference types="node" />
import * as Token from 'token-types';
/**
 * The picture type according to the ID3v2 APIC frame
 * Ref: http://id3.org/id3v2.3.0#Attached_picture
 */
export declare enum AttachedPictureType {
    'Other' = 0,
    "32x32 pixels 'file icon' (PNG only)" = 1,
    'Other file icon' = 2,
    'Cover (front)' = 3,
    'Cover (back)' = 4,
    'Leaflet page' = 5,
    'Media (e.g. label side of CD)' = 6,
    'Lead artist/lead performer/soloist' = 7,
    'Artist/performer' = 8,
    'Conductor' = 9,
    'Band/Orchestra' = 10,
    'Composer' = 11,
    'Lyricist/text writer' = 12,
    'Recording Location' = 13,
    'During recording' = 14,
    'During performance' = 15,
    'Movie/video screen capture' = 16,
    'A bright coloured fish' = 17,
    'Illustration' = 18,
    'Band/artist logotype' = 19,
    'Publisher/Studio logotype' = 20
}
export interface IExtendedHeader {
    size: number;
    extendedFlags: number;
    sizeOfPadding: number;
    crcDataPresent: boolean;
}
/**
 * ID3v2 tag header
 */
export interface IID3v2header {
    fileIdentifier: string;
    version: {
        major: number;
        revision: number;
    };
    flags: {
        raw: number;
        unsynchronisation: boolean;
        isExtendedHeader: boolean;
        expIndicator: boolean;
        footer: boolean;
    };
    size: number;
}
export declare class ID3v2Token {
    /**
     * 28 bits (representing up to 256MB) integer, the msb is 0 to avoid 'false syncsignals'.
     * 4 * %0xxxxxxx
     */
    static UINT32SYNCSAFE: {
        get: (buf: Buffer, off: number) => number;
        len: number;
    };
    /**
     * ID3v2 header
     * Ref: http://id3.org/id3v2.3.0#ID3v2_header
     * ToDo
     */
    static Header: Token.IGetToken<IID3v2header>;
    static ExtendedHeader: Token.IGetToken<IExtendedHeader>;
}
