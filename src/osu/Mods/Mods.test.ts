import { Mod, Mods } from "./Mods";

describe("Mods Tests", () => {
    test("New Instance has correct default value", () => {
        const mods = new Mods();

        expect(mods.numeric).toStrictEqual(0);
        expect(mods.list.length).toStrictEqual(0);
        expect(mods.listString.length).toStrictEqual(0);
        expect(mods.reducedList.length).toStrictEqual(0);
        expect(mods.reducedListString.length).toStrictEqual(0);
        expect(mods.constrain === true);
    });

    test("Adding single mod", () => {
        const mods = new Mods();

        mods.set(Mod.Hidden, true);
        expect(mods.contains(Mod.Hidden)).toStrictEqual(true);
        expect(mods.contains([Mod.Hidden])).toStrictEqual(true);
    });

    test("Adding the same mods twice won't affect anything", () => {
        const mods = new Mods();

        mods.set(Mod.Hidden, true);
        expect(mods.contains(Mod.Hidden)).toStrictEqual(true);

        mods.set(Mod.Hidden, true);
        expect(mods.contains(Mod.Hidden)).toStrictEqual(true);
    });

    test("Adding then removing mod", () => {
        const mods = new Mods();
        mods.set(Mod.Hidden, true);
        expect(mods.listString).toStrictEqual(["Hidden"]);
        expect(mods.contains(Mod.Hidden)).toStrictEqual(true);

        mods.set(Mod.Hidden, false);
        expect(mods.listString).toStrictEqual(["None"]);
        expect(mods.contains(Mod.Hidden)).toStrictEqual(false);
    });

    test("Enabling +NC also enables +DT", () => {
        const mods = new Mods();

        mods.set(Mod.Nightcore, true);
        expect(mods.contains(Mod.DoubleTime)).toStrictEqual(true);
        expect(mods.contains(Mod.Nightcore)).toStrictEqual(true);
    });

    test("Disabling +DT also disables +NC", () => {
        const mods = new Mods();

        mods.set(Mod.Nightcore, true);
        expect(mods.contains(Mod.DoubleTime)).toStrictEqual(true);
        expect(mods.contains(Mod.Nightcore)).toStrictEqual(true);

        mods.set(Mod.DoubleTime, false);
        expect(mods.contains(Mod.DoubleTime)).toStrictEqual(false);
        expect(mods.contains(Mod.Nightcore)).toStrictEqual(false);
    });

    test("Disabling +NC also disables +DT if +NC was enabled", () => {
        const mods = new Mods();

        mods.set(Mod.Nightcore, true);
        expect(mods.contains(Mod.DoubleTime)).toStrictEqual(true);
        expect(mods.contains(Mod.Nightcore)).toStrictEqual(true);

        mods.set(Mod.Nightcore, false);
        expect(mods.contains(Mod.DoubleTime)).toStrictEqual(false);
        expect(mods.contains(Mod.Nightcore)).toStrictEqual(false);
    });

    test("Disabling +NC won't affect +DT if +NC was disabled", () => {
        const mods = new Mods();

        mods.set(Mod.DoubleTime, true);
        mods.set(Mod.Nightcore, false);
        expect(mods.contains(Mod.DoubleTime)).toStrictEqual(true);
        expect(mods.contains(Mod.Nightcore)).toStrictEqual(false);
    });
});
