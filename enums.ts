/**
 * Universe constants
 */
export enum Universe {
  "INVALID" = 0,
  "PUBLIC" = 1,
  "BETA" = 2,
  "INTERNAL" = 3,
  "DEV" = 4,
}

/**
* Type constants
*/
export enum Type {
  "INVALID" = 0,
  "INDIVIDUAL" = 1,
  "MULTISEAT" = 2,
  "GAMESERVER" = 3,
  "ANON_GAMESERVER" = 4,
  "PENDING" = 5,
  "CONTENT_SERVER" = 6,
  "CLAN" = 7,
  "CHAT" = 8,
  "P2P_SUPER_SEEDER" = 9,
  "ANON_USER" = 10,
}

/**
* Instance constants
*/
export enum Instance {
  "ALL" = 0,
  "DESKTOP" = 1,
  "CONSOLE" = 2,
  "WEB" = 4,
}

/**
* TypeChar constants
* @hidden
*/
export enum TypeChar {
  "I" = Type.INVALID,
  "U" = Type.INDIVIDUAL,
  "M" = Type.MULTISEAT,
  "G" = Type.GAMESERVER,
  "A" = Type.ANON_GAMESERVER,
  "P" = Type.PENDING,
  "C" = Type.CONTENT_SERVER,
  "g" = Type.CLAN,
  "T" = Type.CHAT,
  "a" = Type.ANON_USER,
}

export const AccountIDMask = 0xFFFFFFFF;
export const AccountInstanceMask = 0x000FFFFF;

export enum ChatInstanceFlags {
  "Clan" = (AccountInstanceMask + 1) >> 1,
  "Lobby" = (AccountInstanceMask + 1) >> 2,
  "MMSLobby" = (AccountInstanceMask + 1) >> 3,
}
