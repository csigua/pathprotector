class Load extends Phaser.Scene {
    constructor() {
        super("load");
    }

    preload() {
        this.load.setPath("./assets/");

        this.load.image("towerDefense_tilesheet", "towerDefense_tilesheet.png");                         // Packed tilemap
        this.load.tilemapTiledJSON("gamemap", "gamemap.json");

        this.load.spritesheet("tilemap_sheet", "towerDefense_tilesheet.png", {
            frameWidth: 64,
            frameHeight: 64
        });

        this.load.multiatlas("kenny-particles", "kenny-particles.json");
    }

    create() {
         this.scene.start("game");
    }

    update() {
    }
}