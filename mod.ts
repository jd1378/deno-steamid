import { UINT64 } from "./uint64.js";

import {
  ChatInstanceFlags,
  Instance,
  Type,
  TypeChar,
  Universe,
} from "./enums.ts";

/**
 * @hidden
 */
const regex = {
  steam2: /^STEAM_([0-5]):([0-1]):([0-9]+)$/,
  steam3: /^\[([a-zA-Z]):([0-5]):([0-9]+)(:[0-9]+)?\]$/,
  numberOnly: /^[0-9]+$/,
};

/**
 * Returns Type for Char
 * @hidden
 */
const getTypeFromChar = (char: string) => {
  if (
    TypeChar[char as keyof typeof TypeChar]
  ) {
    return TypeChar[char as keyof typeof TypeChar];
  }

  return Type.INVALID;
};

/**
 * @hidden
 */
export type Format = "none" | "steam2" | "steam3" | "steam64" | "accountid";

export class SteamID {
  public universe: number;
  public type: number;
  public instance: number;
  public accountid: number;
  public format: Format;

  constructor(input?: string | number) {
    this.universe = Universe.INVALID;
    this.type = Type.INVALID;
    this.instance = Instance.ALL;
    this.accountid = 0;
    this.format = "none";

    if (!input) {
      return;
    }

    if (typeof input === "string" && input.match(regex.steam2)) {
      const matches = input.match(regex.steam2) as RegExpMatchArray;
      this.format = "steam2";
      this.universe = parseInt(matches[1], 10) || Universe.PUBLIC;
      this.type = Type.INDIVIDUAL;
      this.instance = Instance.DESKTOP;
      this.accountid = (parseInt(matches[3], 10) * 2) +
        parseInt(matches[2], 10);
    } else if (typeof input === "string" && input.match(regex.steam3)) {
      const matches = input.match(regex.steam3) as RegExpMatchArray;
      const char = matches[1];
      this.format = "steam3";
      this.universe = parseInt(matches[2], 10);
      this.accountid = parseInt(matches[3], 10);

      if (matches[4]) {
        this.instance = parseInt(matches[4].substring(1), 10);
      } else if (char === "U") {
        this.instance = Instance.DESKTOP;
      }

      if (char === "c") {
        this.instance |= ChatInstanceFlags.Clan;
        this.type = Type.CHAT;
      } else if (char === "L") {
        this.instance |= ChatInstanceFlags.Lobby;
        this.type = Type.CHAT;
      } else {
        this.type = getTypeFromChar(char);
      }
    } else if (
      isNaN(input as number) || !regex.numberOnly.test(input as string)
    ) {
      throw new Error(`Unknown SteamID input format "${input}"`);
    } else {
      // deno-lint-ignore ban-ts-comment
      // @ts-ignore
      const x = new UINT64(input, 10);
      this.format = "steam64";
      this.accountid = (x.toNumber() & 0xFFFFFFFF) >>> 0;
      this.instance = x.shiftRight(32).toNumber() & 0xFFFFF;
      this.type = x.shiftRight(20).toNumber() & 0xF;
      this.universe = x.shiftRight(4).toNumber();
    }
  }

  /**
     * Check whether this ID is valid
     * @return {boolean}
     */
  public isValid = (): boolean => {
    if (this.type <= Type.INVALID || this.type > Type.ANON_USER) {
      return false;
    }

    if (this.universe <= Universe.INVALID || this.universe > Universe.DEV) {
      return false;
    }

    if (
      this.type === Type.INDIVIDUAL &&
      (this.accountid === 0 || this.instance > Instance.WEB)
    ) {
      return false;
    }

    if (
      this.type === Type.CLAN &&
      (this.accountid === 0 || this.instance !== Instance.ALL)
    ) {
      return false;
    }

    if (this.type === Type.GAMESERVER && this.accountid === 0) {
      return false;
    }
    return true;
  };

  /**
     * Check whether this ID is tied to a steam groupchat
     * @return {boolean}
     */
  public isGroupChat = (): boolean => {
    return !!(this.type === Type.CHAT &&
      this.instance & ChatInstanceFlags.Clan);
  };

  /**
     * Check whether this ID is a steam lobby
     * @return {boolean}
     */
  public isLobby = (): boolean => {
    return !!(this.type === Type.CHAT &&
      (this.instance & ChatInstanceFlags.Lobby ||
        this.instance & ChatInstanceFlags.MMSLobby));
  };

  /**
     * Render this ID in the Steam2 format
     * @param format - true if you want to use 1 in place of the leading 0 for the public universe
     * @return {string}
     */
  public getSteam2ID = (format?: boolean): string => {
    if (this.type !== Type.INDIVIDUAL) {
      throw new Error(`Can't get Steam2 rendered ID for non-individual ID`);
    } else {
      let universe = this.universe;
      if (!format && universe === 1) {
        universe = 0;
      }
      return `STEAM_${universe}:${(this.accountid & 1)}:${
        Math.floor(this.accountid / 2)
      }`;
    }
  };

  /**
     * Render this ID in the Steam3 format
     * @return {string}
     */
  public getSteam3ID = (): string => {
    let char = TypeChar[this.type] || "i";

    if (this.instance & ChatInstanceFlags.Clan) {
      char = "c";
    } else if (this.instance & ChatInstanceFlags.Lobby) {
      char = "L";
    }

    const renderInstance = (
      this.type === Type.ANON_GAMESERVER ||
      this.type === Type.MULTISEAT ||
      (this.type === Type.INDIVIDUAL && this.instance !== Instance.DESKTOP)
    );
    return `[${char}:${this.universe}:${this.accountid}${(renderInstance
      ? ":" + this.instance
      : "")}]`;
  };

  /**
     * Render this ID in the 64-bit format
     * @return {string}
     */
  public getSteamID64 = (): string => {
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    return new UINT64(
      this.accountid,
      (this.universe << 24) | (this.type << 20) | (this.instance),
    ).toString(10);
  };

  /**
     * Render this ID in the 64-bit format
     * @return {string}
     */
  public toString = this.getSteamID64;

  /**
     * Return the Universe of the current ID
     * @return {string}
     */
  public getUniverse = (): string => {
    return Universe[this.universe];
  };

  /**
     * Return the Type of the current ID
     * @return {string}
     */
  public getType = (): string => {
    return Type[this.type];
  };

  /**
     * Return the Instance of the current ID
     * @return {string}
     */
  public getInstance = (): string => {
    return Instance[this.instance];
  };

  /**
     * Return the Universe ID of the current ID
     * @return {number}
     */
  public getUniverseID = (): number => {
    return this.universe;
  };

  /**
     * Return the Type ID of the current ID
     * @return {number}
     */
  public getTypeID = (): number => {
    return this.type;
  };

  /**
     * Return the Instance ID of the current ID
     * @return {number}
     */
  public getInstanceID = (): number => {
    return this.instance;
  };

  /**
     * Return the Account ID of the current ID
     * @return {number}
     */
  public getAccountID = (): number => {
    return this.accountid;
  };

  /**
     * Return the format that was used to generate the current ID
     * @return {string}
     */
  public getFormat = (): Format => {
    return this.format;
  };

  /**
  * Create an individual ID in the public universe with an accountid and desktop instance
  * @param accountid - The user's account ID
  * @return {SteamID}
  */
  static fromIndividualAccountID(accountid: number | string): SteamID {
    let parsedAccountId = 0;
    if (typeof accountid === "string") {
      parsedAccountId = parseInt(accountid, 10);
    } else {
      parsedAccountId = accountid;
    }
    const x = new SteamID();
    x.universe = Universe.PUBLIC;
    x.type = Type.INDIVIDUAL;
    x.instance = Instance.DESKTOP;
    x.accountid = isNaN(parsedAccountId) ? 0 : parsedAccountId;
    x.format = "accountid";
    return x;
  }

  public static Universe = Universe;
  public static Type = Type;
  public static Instance = Instance;
}

export * from "./enums.ts";
