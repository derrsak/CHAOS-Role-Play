mp.events.add('soundplay', (idfrac, numbersound) => {
    if (idfrac == 1) {
        if (numbersound == 1) {
            global.soundCEF.execute(`playSound('./sounds/GOV_1.ogg');`);
        }
        if (numbersound == 2) {
            global.soundCEF.execute(`playSound('./sounds/GOV_2.ogg');`);
        }
        if (numbersound == 3) {
            global.soundCEF.execute(`playSound('./sounds/GOV_3.ogg');`);
        }
        if (numbersound == 4) {
            global.soundCEF.execute(`playSound('./sounds/GOV_4.ogg');`);
        }
    }
    else if (idfrac == 2) {
        if (numbersound == 1) {
            global.soundCEF.execute(`playSound('./sounds/LSPD_1.ogg');`);
        }
        if (numbersound == 2) {
            global.soundCEF.execute(`playSound('./sounds/LSPD_2.ogg');`);
        }
        if (numbersound == 3) {
            global.soundCEF.execute(`playSound('./sounds/LSPD_3.ogg');`);
        }

    }
    else if (idfrac == 3) {
        if (numbersound == 1) {
            global.soundCEF.execute(`playSound('./sounds/LSSD_1.ogg');`);
        }
        if (numbersound == 2) {
            global.soundCEF.execute(`playSound('./sounds/LSSD_2.ogg');`);
        }
        if (numbersound == 3) {
            global.soundCEF.execute(`playSound('./sounds/LSSD_3.ogg');`);
        }
        if (numbersound == 4) {
            global.soundCEF.execute(`playSound('./sounds/LSSD_4.ogg');`);
        }
    }
    else if (idfrac == 4) {
        if (numbersound == 1) {
            global.soundCEF.execute(`playSound('./sounds/FIB_1.ogg');`);
        }
        if (numbersound == 2) {
            global.soundCEF.execute(`playSound('./sounds/FIB_2.ogg');`);
        }
        if (numbersound == 3) {
            global.soundCEF.execute(`playSound('./sounds/FIB_3.ogg');`);
        }
        if (numbersound == 4) {
            global.soundCEF.execute(`playSound('./sounds/FIB_4.ogg');`);
        }
    }
    else if (idfrac == 5) {
        if (numbersound == 1) {
            global.soundCEF.execute(`playSound('./sounds/EMS_1.ogg');`);
        }
    }
	else if (idfrac == 6) {
        if (numbersound == 1) {
            global.soundCEF.execute(`playSound('./sounds/SANG_1.ogg');`);
        }
		if (numbersound == 2) {
            global.soundCEF.execute(`playSound('./sounds/SANG_2.ogg');`);
        }
		if (numbersound == 3) {
            global.soundCEF.execute(`playSound('./sounds/SANG_3.ogg');`);
        }
		if (numbersound == 4) {
            global.soundCEF.execute(`playSound('./sounds/SANG_4.ogg');`);
        }
    }

});