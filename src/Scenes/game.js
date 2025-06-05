class Game extends Phaser.Scene {
    constructor() {
        super("game");
    }

    preload() {
        // this.load.setPath("./assets/");
        // this.load.image("boss", "boss.png");
        // this.load.setPath("./assets/Audio/");
        // this.load.audio("enemyFire2", "select_005.ogg");
    }

    create() {
        // button colors
        const baseColor = 0x222222;
        const pressColor = 0x666666;
        const hoverColor = 0x444444;

        // tower types
        const BASIC = 1;

        // create map
        this.map = this.add.tilemap("gamemap", 64, 64, 20, 15);
        this.pickedTileset = this.map.addTilesetImage("towerDefense_tilesheet", "towerDefense_tilesheet");

        this.groundLayer = this.map.createLayer("Ground-map", this.pickedTileset, 0, 0);

        this.Spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // enemy path
        this.enemyPath = new Phaser.Curves.Path(192,-50);
        this.enemyPath.lineTo(192,768);
        this.enemyPath.lineTo(640,768);
        this.enemyPath.lineTo(640,192);
        this.enemyPath.lineTo(1088,192);
        this.enemyPath.lineTo(1088,1000);

        // enemy array
        this.enemyArray = [];

        //tower constants
        this.BASIC_SPEED = 70;

        // tower groups
        this.towerGroup = this.add.group({
            defaultKey: "tower",
            maxSize: 100
        });
        this.turretGroup = this.add.group({
            defaultKey: "turret",
            maxSize: 100
        });

        // bullet groups
        this.bulletGroup = this.add.group({
            defaultKey: "bullet",
            maxSize: 100
        })

        // mouse movement (inspired by https://phaser.io/examples/v3.85.0/geom/line/view/equals)
        this.clickedTileIndex = 0;
        this.pickedTile = undefined;
        this.tileX = 0;
        this.tileY = 0;
        this.mousePos = [0,0];
        this.input.on('pointerdown', pointer => {
            const x = pointer.x;
            const y = pointer.y;

            this.mousePos = [x,y]; // for debugging

            if (x <= 1280) {
                this.pickedTile = this.map.getTileAtWorldXY(x, y);
                // console.log(this.pickedTile);
                let placeable = this.pickedTileset.getTileProperties(this.pickedTile.index).placeable;
                if (placeable && this.clickedTileIndex != this.pickedTile) {
                    let squaredTile = this.map.filterTiles(tile => tile.index === 43);
                    for (const pTile of squaredTile) {
                        this.map.putTileAt(25, pTile.x, pTile.y, true);
                    }
                    this.map.putTileAt(43, this.pickedTile.x, this.pickedTile.y, true);
                    this.tileX = this.pickedTile.pixelX + 32;
                    this.tileY = this.pickedTile.pixelY + 32;
                }
                if (this.pickedTile && this.pickedTile.hasTower) {
                    this.rangeCircle.x = this.tileX;
                    this.rangeCircle.y = this.tileY;
                    this.rangeCircle.visible = true;
                }
                else {
                    this.rangeCircle.visible = false;
                }
            }
        });

        // range circle
        this.towerRange = 180;
        this.rangeCircle = this.add.circle(0, 0, this.towerRange);
        this.rangeCircle.setFillStyle(0x00FFFF, 0.2);
        this.rangeCircle.setStrokeStyle(4, 0xFFFFFF, 0.6);
        this.rangeCircle.visible = false;

        // buy button
        const buyButton = this.add.rectangle(1390, 80, 160, 80, baseColor);
        buyButton.setInteractive();
        buyButton.on("pointerover", () => {
            buyButton.fillColor = hoverColor;
            // buyButton.setStrokeStyle(4, 0x880000);
            if (this.pickedTile) {
                this.rangeCircle.visible = true;
            }
            this.rangeCircle.x = this.tileX;
            this.rangeCircle.y = this.tileY;
        });
        buyButton.on("pointerup", () => {
            buyButton.fillColor = baseColor;
            // buyButton.setStrokeStyle(8, 0xFF0000);
            // create/buy tower
            this.allowPlace = true;
            // don't let player put multiple towers on one tile. bad!
            for (const tower of this.towerGroup.getChildren()) {
                if (tower.x === this.tileX && tower.y === this.tileY) {
                    this.pickedTile.hasTower = true;
                    this.allowPlace = false;
                }
            }
            // TODO: implement cost
            if (this.allowPlace) {
                this.pickedTile.hasTower = true;
                this.towerGroup.create(this.tileX, this.tileY, "tilemap_sheet", 180);
                this.turretGroup.create(this.tileX, this.tileY, "tilemap_sheet", 249);
            }
        });
        buyButton.on("pointerdown", () => {
            buyButton.fillColor = pressColor;
            // buyButton.setStrokeStyle(2, 0x000000);
        });
        buyButton.on("pointerout", () => {
            buyButton.fillColor = baseColor;
            this.rangeCircle.visible = false;
        });

        // enemy types [texture, spawn speed]
        const PLANE = [271,10];

        // waves [enemy type, number of enemy]
        let WAVE1 = [
            [PLANE, 5]
        ];
        this.waves = [WAVE1];

        // wave start button

        this.waveOngoing = false;
        this.waveCounter = 0;
        this.wave = this.waves[0];

        const waveButton = this.add.rectangle(1390, 880, 160, 80, baseColor);
        waveButton.setInteractive();
        waveButton.on('pointerover', () => {
            waveButton.fillColor = hoverColor;
        });
        waveButton.on('pointerup', () => {
            waveButton.fillColor = baseColor;
            if (!this.waveOngoing) {
                // start wave
                // load enemies
                let wave = this.waves[this.waveCounter];
                for (const group of wave) {
                    for (let spawns = 0; spawns < group[1]; spawns++) { //group[1] is the number of enemies that will spawn
                        let newEnemy = this.add.follower(this.enemyPath, this.enemyPath.startPoint.x, this.enemyPath.startPoint.y, "tilemap_sheet", group[0][0])
                        newEnemy.visible = false;
                        this.enemyArray.push(newEnemy);
                    }
                }
                this.waveOngoing = true;
            }
        });
        waveButton.on('pointerdown', () => {
            waveButton.fillColor = pressColor;
        });
        waveButton.on('pointerout', () => {
            waveButton.fillColor = baseColor;
        })

        // counters
        this.enemySpawnCounter = 0;
    }

    update(time, delta) {
        this.enemySpawnCounter--;
        
        // check if enemies go offscreen
        for (const enemy of this.enemyArray) {
            if (enemy.y > 960) {
                this.enemyArray = this.enemyArray.filter(x => x !== enemy);
                enemy.destroy();
                // TODO: remove a life from the player
            }
        }

        // console.log(this.enemyArray.length);

        // wave ends
        if (this.enemyArray.length === 0 && this.waveOngoing) {
            this.waveOngoing = false;
        }

        // ongoing wave
        if (this.waveOngoing && this.enemySpawnCounter < 0) {
            for (const enemy of this.enemyArray) {
                if (!enemy.visible) {
                    enemy.startFollow({
                        from: 0,
                        to: 1,
                        delay: 0,
                        duration: 20000,
                        ease: 'Linear',
                        repeat: -1,
                        yoyo: false,
                        rotateToPath: true
                    });
                    enemy.visible = true;
                    break;
                }
            }
            this.enemySpawnCounter = this.wave[0][0][1] * delta;
        }

        // towers search for enemies (rotation)
        let target;
        let x;
        let y;
        // search for first enemy
        for (const enemy of this.enemyArray) {
            if (enemy.visible) {
                target = enemy;
                x = target.x;
                y = target.y;
                break;
            }
        }
        if (target) {
            for (const turret of this.turretGroup.getChildren()) {
                if (x > turret.x) {
                    this.rotationVal = Math.atan(((y-turret.y) / (x-turret.x))) + Math.PI/2;
                }
                else {
                    this.rotationVal = Math.atan(((y-turret.y) / (x-turret.x))) + Math.PI * (3/2);   
                }
                turret.setRotation(this.rotationVal);
            }
        }
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