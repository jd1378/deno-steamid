# deno-steamid

port from <https://github.com/node-steam/id> and <https://github.com/DoctorMcKay/node-steamid/>

I copied UINT64 over from <https://github.com/pierrec/js-cuint>

Had to do some manual work to fix tests.

## simple usage

```ts
import { SteamID } from 'https://deno.land/x/steamid@v1.2.0/mod.ts';
const sid = new SteamID("steam2 or steam3 or sid64 here");
// ...
```
