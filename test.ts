import { ChatInstanceFlags, Instance, SteamID, Type, Universe } from "./mod.ts";
import {
  assertEquals,
  assertStrictEquals,
  assertThrows,
} from "https://deno.land/std@0.84.0/testing/asserts.ts";

// deno-lint-ignore no-explicit-any
function checkProperty(obj: any, prop: string, expected: any) {
  assertStrictEquals(
    obj[prop],
    expected,
    "unexpected " + prop + " value " + obj[prop],
  );
}
// deno-lint-ignore no-explicit-any
function checkProperties(obj: any, expected: any) {
  for (const prop in expected) {
    checkProperty(obj, prop, expected[prop]);
  }
}

Deno.test("parameterless construction", () => {
  const sid = new SteamID();
  checkProperties(sid, {
    "universe": Universe.INVALID,
    "type": Type.INVALID,
    "instance": Instance.ALL,
    "accountid": 0,
  });
});

Deno.test("fromIndividualAccountID construction", () => {
  const sid = SteamID.fromIndividualAccountID(46143802);
  checkProperties(sid, {
    "universe": Universe.PUBLIC,
    "type": Type.INDIVIDUAL,
    "instance": Instance.DESKTOP,
    "accountid": 46143802,
  });
});

Deno.test("fromIndividualAccountID invalid", () => {
  const sid = SteamID.fromIndividualAccountID("");
  assertEquals(sid.isValid(), false);
});

Deno.test("steam2id construction (universe 0)", () => {
  const sid = new SteamID("STEAM_0:0:23071901");
  checkProperties(sid, {
    "universe": Universe.PUBLIC,
    "type": Type.INDIVIDUAL,
    "instance": Instance.DESKTOP,
    "accountid": 46143802,
  });
});

Deno.test("steam2id construction (universe 1)", () => {
  const sid = new SteamID("STEAM_1:1:23071901");
  checkProperties(sid, {
    "universe": Universe.PUBLIC,
    "type": Type.INDIVIDUAL,
    "instance": Instance.DESKTOP,
    "accountid": 46143803,
  });
});

Deno.test("steam3id construction (individual)", () => {
  const sid = new SteamID("[U:1:46143802]");
  checkProperties(sid, {
    "universe": Universe.PUBLIC,
    "type": Type.INDIVIDUAL,
    "instance": Instance.DESKTOP,
    "accountid": 46143802,
  });
});

Deno.test("steam3id construction (gameserver)", () => {
  const sid = new SteamID("[G:1:31]");
  checkProperties(sid, {
    "universe": Universe.PUBLIC,
    "type": Type.GAMESERVER,
    "instance": Instance.ALL,
    "accountid": 31,
  });
});

Deno.test("steam3id construction (anon gameserver)", () => {
  const sid = new SteamID("[A:1:46124:11245]");
  checkProperties(sid, {
    "universe": Universe.PUBLIC,
    "type": Type.ANON_GAMESERVER,
    "instance": 11245,
    "accountid": 46124,
  });
});

Deno.test("steam3id construction (lobby)", () => {
  const sid = new SteamID("[L:1:12345]");
  checkProperties(sid, {
    "universe": Universe.PUBLIC,
    "type": Type.CHAT,
    "instance": ChatInstanceFlags.Lobby,
    "accountid": 12345,
  });
});

Deno.test("steam3id construction (lobby with instanceid)", () => {
  const sid = new SteamID("[L:1:12345:55]");
  checkProperties(sid, {
    "universe": Universe.PUBLIC,
    "type": Type.CHAT,
    "instance": ChatInstanceFlags.Lobby | 55,
    "accountid": 12345,
  });
});

Deno.test("steamid64 construction (individual)", () => {
  const sid = new SteamID("76561198006409530");
  checkProperties(sid, {
    "universe": Universe.PUBLIC,
    "type": Type.INDIVIDUAL,
    "instance": Instance.DESKTOP,
    "accountid": 46143802,
  });
});

Deno.test("steamid64 construction (clan)", () => {
  const sid = new SteamID("103582791434202956");
  checkProperties(sid, {
    "universe": Universe.PUBLIC,
    "type": Type.CLAN,
    "instance": Instance.ALL,
    "accountid": 4681548,
  });
});

Deno.test("invalid construction", () => {
  assertThrows(
    function () {
      new SteamID("invalid input");
    },
    Error,
    "Unknown SteamID input format",
    "expected invalid input to throw Error",
  );
});

Deno.test("steam2id rendering (universe 0)", () => {
  const sid = new SteamID();
  sid.universe = Universe.PUBLIC;
  sid.type = Type.INDIVIDUAL;
  sid.instance = Instance.DESKTOP;
  sid.accountid = 46143802;
  const val = sid.getSteam2ID();
  assertStrictEquals(
    val,
    "STEAM_0:0:23071901",
    "unexpected rendered steam2id value " + val,
  );
});

Deno.test("steam2id rendering (universe 1)", () => {
  const sid = new SteamID();
  sid.universe = Universe.PUBLIC;
  sid.type = Type.INDIVIDUAL;
  sid.instance = Instance.DESKTOP;
  sid.accountid = 46143802;
  const val = sid.getSteam2ID(true);
  assertStrictEquals(
    val,
    "STEAM_1:0:23071901",
    "unexpected rendered steam2id value " + val,
  );
});

Deno.test("steam2id rendering (non-individual)", () => {
  const sid = new SteamID();
  sid.universe = Universe.PUBLIC;
  sid.type = Type.CLAN;
  sid.instance = Instance.DESKTOP;
  sid.accountid = 4681548;
  assertThrows(
    sid.getSteam2ID.bind(sid),
    Error,
    "Can't get Steam2 rendered ID for non-individual ID",
    "expected error for rendered steam2id for non-individual type",
  );
});

Deno.test("steam3id rendering (individual)", () => {
  const sid = new SteamID();
  sid.universe = Universe.PUBLIC;
  sid.type = Type.INDIVIDUAL;
  sid.instance = Instance.DESKTOP;
  sid.accountid = 46143802;
  const val = sid.getSteam3ID();
  assertStrictEquals(
    val,
    "[U:1:46143802]",
    "unexpected rendered steam3id value " + val,
  );
});

Deno.test("steam3id rendering (anon gameserver)", () => {
  const sid = new SteamID();
  sid.universe = Universe.PUBLIC;
  sid.type = Type.ANON_GAMESERVER;
  sid.instance = 41511;
  sid.accountid = 43253156;
  const val = sid.getSteam3ID();
  assertStrictEquals(
    val,
    "[A:1:43253156:41511]",
    "unexpected rendered steam3id value " + val,
  );
});

Deno.test("steam3id rendering (lobby)", () => {
  const sid = new SteamID();
  sid.universe = Universe.PUBLIC;
  sid.type = Type.CHAT;
  sid.instance = ChatInstanceFlags.Lobby;
  sid.accountid = 451932;
  const val = sid.getSteam3ID();
  assertStrictEquals(val, "[L:1:451932]");
});

Deno.test("steamid64 rendering (individual)", () => {
  const sid = new SteamID();
  sid.universe = Universe.PUBLIC;
  sid.type = Type.INDIVIDUAL;
  sid.instance = Instance.DESKTOP;
  sid.accountid = 46143802;
  const val = sid.getSteamID64();
  assertStrictEquals(
    val,
    "76561198006409530",
    "unexpected rendered steamid64 value " + val,
  );
});

Deno.test("steamid64 rendering (anon gameserver)", () => {
  const sid = new SteamID();
  sid.universe = Universe.PUBLIC;
  sid.type = Type.ANON_GAMESERVER;
  sid.instance = 188991;
  sid.accountid = 42135013;
  const val = sid.getSteamID64();
  assertStrictEquals(
    val,
    "90883702753783269",
    "unexpected rendered steamid64 value " + val,
  );
});

Deno.test("invalid new id", () => {
  const sid = new SteamID();
  assertEquals(sid.isValid(), false, "expected new id to be invalid");
});

Deno.test("invalid individual instance", () => {
  const sid = new SteamID("[U:1:46143802:10]");
  assertEquals(
    sid.isValid(),
    false,
    "expected individual id with instance 10 to be invalid",
  );
});

Deno.test("invalid non-all clan instance", () => {
  const sid = new SteamID("[g:1:4681548:2]");
  assertEquals(
    sid.isValid(),
    false,
    "expected clan id with instance 2 to be invalid",
  );
});

Deno.test("invalid gameserver id with accountid 0", () => {
  const sid = new SteamID("[G:1:0]");
  assertEquals(
    sid.isValid(),
    false,
    "expected gameserver id with accountid 0 to be invalid",
  );
});
