class Game extends Phaser.Scene {
    constructor() {
        super("game");

        // this.posX = 400;
        // this.posY = 700;

        // this.maxEnemies = 10;
    }

    preload() {
        // this.load.setPath("./assets/");
        // this.load.image("boss", "boss.png");
        // this.load.setPath("./assets/Audio/");
        // this.load.audio("enemyFire2", "select_005.ogg");
    }

    create() {
        let my = this.my;

        // create map
        this.map = this.add.tilemap("gamemap", 64, 64, 20, 15);
        this.tileset = this.map.addTilesetImage("towerDefense_tilesheet", "towerDefense_tilesheet");

        this.groundLayer = this.map.createLayer("Ground-map", this.tileset, 0, 0);

        this.Spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // ENEMY PATH
        // this.points = [
        //     850,479,
        //     687,72,
        //     88,80,
        //     97,520,
        //     688,521,
        //     685,114,
        //     95,117,
        //     -50,499
        // ];
        // this.curve = new Phaser.Curves.Spline(this.points);

        // mouse movement (inspired by https://phaser.io/examples/v3.85.0/geom/line/view/equals)
        this.hoveredTile = 0;
        this.input.on('pointermove', pointer => {
            const x = pointer.x;
            const y = pointer.y;

            let tile = this.map.getTileAtWorldXY(x, y);
            if (this.tileset.getTileProperties(tile.index).placeable) {
                this.map.putTileAt(43, tile.x, tile.y, true);
                console.log('asdkjfhalsdjkfh');
            }
        });

        // button prototype
        const rect = this.add.rectangle(200, 200, 148, 148, 0x222222);
        rect.setInteractive();
        rect.on("pointerdown", () => {
            rect.fillColor = 0xFFFFFF;
            rect.setStrokeStyle(16, 0xFF0000);
        });
        rect.on("pointerup", () => {
            rect.fillColor = 0x222222;
            rect.setStrokeStyle(0, 0x3fc53f);
        });

    }

    update(time, delta) {
    }

    collides(a, b) 
    // a & b are sprites/
    // gameObjs(AABBs)
    {
      if (Math.abs(a.x - b.x) > (a.displayWidth/3 + b.displayWidth/3)) return false;
      if (Math.abs(a.y - b.y) > (a.displayHeight/3 + b.displayHeight/3)) return false;
      return true;
    }
}