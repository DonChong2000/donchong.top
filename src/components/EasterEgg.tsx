'use client';

import { useEffect } from 'react';

export default function EasterEgg() {
  useEffect(() => {
    console.log(`
      @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      @@@                               @@@
      @@@                               @@@
      @@@                               @@@
      @@@     @@@@@@@@@@@@@@@@          @@@
      @@@       @@@@@@    @@@@@@        @@@
      @@@       @@@@@@     @@@@@@       @@@
      @@@       @@@@@@      @@@@@@      @@@
      @@@       @@@@@@      @@@@@@      @@@
      @@@       @@@@@@      @@@@@@      @@@
      @@@       @@@@@@      @@@@@@      @@@
      @@@       @@@@@@     @@@@@@@      @@@
      @@@       @@@@@@     @@@@@@       @@@
      @@@       @@@@@@    @@@@@         @@@
      @@@     @@@@@@@@@@@@@             @@@
      @@@                               @@@
      @@@                               @@@
      @@@                               @@@
      @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


      Think -> try -> repeat.
      donchong.top/aboutMe

      ---------------------------------------
      Hey there, fellow dev! o7
      Appreciate you taking a peek under the hood.
    `);

  }, []);

  return null;
}
