# deno-steamid

port from <https://github.com/node-steam/> and <https://github.com/DoctorMcKay/node-steamid/>

I copied UINT64 over from <https://github.com/pierrec/js-cuint>

I have removed aliases (short hand versions).

Had to do some manual work to fix tests.

some renames from `DoctorMcKay/node-steamid`:

- `getSteam2RenderedID` => `getSteam2ID`
- `getSteam3RenderedID` => `getSteam3ID`

## simple usage

```ts
import { SteamID } from 'https://deno.land/x/steamid@v1.0.0/mod.ts';
const sid = new SteamID("steam2 or steam3 or sid64 here");
// ...
```
