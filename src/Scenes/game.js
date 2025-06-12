class Game extends Phaser.Scene {
    constructor() {
        super("game");
    }

    preload() {
        // this.load.setPath("./assets/");
        // this.load.image("boss", "boss.png");
        // this.load.setPath("./assets/Audio/");
        // this.load.audio("enemyFire2", "select_005.ogg");

        this.load.setPath("./assets/kenney_ui-audio/Audio/");
        this.load.audio("fire", "click2.ogg");
        this.load.audio("death", "rollover3.ogg");
        this.load.audio("place", "switch18.ogg");

        this.load.setPath("./assets/kenney_rpg-audio/Audio/");
        this.load.audio("sell", "beltHandle2.ogg");
        this.load.audio("waveStart", "cloth3.ogg");
        this.load.audio("lose", "dropLeather.ogg");
        this.load.audio("end", "doorClose_4.ogg");
    }

    create() {
        // button colors
        const baseColor = 0x222222;
        const pressColor = 0x666666;
        const hoverColor = 0x444444;

        const startColor = 0x004400;
        const waitColor = 0x440000;

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
        this.BASIC_SPEED = 50;

        // tower groups
        this.towerGroup = this.add.group({
            defaultKey: "tower",
            maxSize: 100
        });

        //vfx
        my.vfx.fire = this.add.particles(-200, -200, "kenny-particles", {
            frame: ['star_05.png', 'star_04.png'],
            random: true,
            scale: {start: 0.4, end: 0.1},
            duration: 40,
            lifespan: 250,
            speedX: {min: -150, max: 150},
            speedY: {min: -150, max: 150},
            alpha: {start: 1, end: 0.3} 
        });
        my.vfx.fire.stop();

        my.vfx.death = this.add.particles(-200, -200, "kenny-particles", {
            frame: ['smoke_09.png'],
            random: true,
            scale: {start: 0.3, end: 0.1},
            duration: 40,
            lifespan: 250,
            speedX: {min: -350, max: 350},
            speedY: {min: -350, max: 350},
            alpha: {start: 1, end: 0.3} 
        });
        my.vfx.death.stop();

        my.vfx.place = this.add.particles(-200, -200, "kenny-particles", {
            frame: ['circle_02.png'],
            random: true,
            scale: {start: 0.0, end: 0.6},
            duration: 100,
            lifespan: 300,
            alpha: {start: 0.5, end: 0.7}         
        });

        // turret class
        var Turret = new Phaser.Class({
            Extends: Phaser.GameObjects.Image,
            initialize:
            function Turret(scene) {
                this.scene = scene;
                Phaser.GameObjects.Image.call(this, scene, 0, 0, "tilemap_sheet", 249);
                this.shotTimer = 0;
            },
            place: function (x,y) {
                this.setPosition(x,y);
                this.setActive(true);
                this.setVisible(true);
            },
            search: function () {
                let target;
                // search for first enemy
                for (const enemy of this.scene.enemyArray) {
                    if (enemy.visible) {
                        target = enemy;
                        break;
                    }
                }
                if (target) {
                    if (target.x > this.x) {
                        this.rotationVal = Math.atan(((target.y-this.y) / (target.x-this.x))) + Math.PI/2;
                    }
                    else {
                        this.rotationVal = Math.atan(((target.y-this.y) / (target.x-this.x))) + Math.PI * (3/2);   
                    }
                    this.setRotation(this.rotationVal);
                }
            },
            fire: function() {
                let target;
                // search for first enemy
                for (const enemy of this.scene.enemyArray) {
                    if (enemy.visible) {
                        target = enemy;
                        break;
                    }
                }
                if (target) {
                    let angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
                    let dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
                    let bullet = this.scene.bulletGroup.get();
                    if (bullet && dist < this.scene.towerRange) {
                        bullet.fire(this.x, this.y, angle);
                        this.scene.sound.play("fire", {volume: 0.5});
                    }
                }
            },
            update: function (time, delta) {
                if (time > this.shotTimer) {
                    this.fire();
                    this.shotTimer = time + 1000;
                }
            }
        });

        this.turretGroup = this.add.group({
            classType: Turret,
            defaultKey: "turret",
            maxSize: 100,
            runChildUpdate: true
        });

        // bullet class
        var Bullet = new Phaser.Class({
            Extends: Phaser.GameObjects.Image,
            initialize:
            function Bullet(scene, directionX, directionY) {
                Phaser.GameObjects.Image.call(this, scene, -50, -50, "tilemap_sheet", 297);
                this.dx = 0;
                this.dy = 0;
                this.bulletSpeed = 1000;
                this.speed = Phaser.Math.GetSpeed(this.bulletSpeed, 1);
                this.visible = false;
                this.speedX = directionX * this.speed;
                this.speedY = directionY * this.speed;
            },
            fire: function(x,y,angle) {
                this.setPosition(x, y);
                this.active = true;
                this.visible = true;

                this.setRotation(angle - Math.PI/2);
                this.dx = Math.cos(angle);
                this.dy = Math.sin(angle);
                my.vfx.fire.x = this.x + this.dx * 50;
                my.vfx.fire.y = this.y + this.dy * 50;
                my.vfx.fire.start();
            },
            update: function(time, delta) {
                this.x += this.dx * (this.speed * delta);
                this.y += this.dy * (this.speed * delta);
            }
        });

        // bullet groups
        this.bulletGroup = this.add.group({
            classType: Bullet,
            defaultKey: "bullet",
            maxSize: 100,
            runChildUpdate: true
        });

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
                    for (const tower of this.towerGroup.getChildren()) {
                        if (tower.x === this.tileX && tower.y === this.tileY) {
                            this.selectedTower = tower;
                            break;
                        }
                    }
                }
                else {
                    this.rangeCircle.visible = false;
                    this.selectedTower = undefined;
                }
            }
        });

        this.towerPrice = 5;

        // range circle
        this.towerRange = 200;
        this.rangeCircle = this.add.circle(0, 0, this.towerRange - 30);
        this.rangeCircle.setFillStyle(0x00FFFF, 0.2);
        this.rangeCircle.setStrokeStyle(4, 0xFFFFFF, 0.6);
        this.rangeCircle.visible = false;

        // buy button
        const buyButton = this.add.rectangle(1390, 700, 160, 120, baseColor);
        buyButton.setInteractive();
        buyButton.setStrokeStyle(4, pressColor);
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
                else if (this.money < this.towerPrice) {
                    this.allowPlace = false;
                }
            }
            // TODO: implement cost
            if (this.allowPlace) {
                this.pickedTile.hasTower = true;
                this.towerGroup.create(this.tileX, this.tileY, "tilemap_sheet", 180);
                let turret = this.turretGroup.get();
                if (turret) {
                    turret.place(this.tileX, this.tileY);
                    my.vfx.place.x = this.tileX;
                    my.vfx.place.y = this.tileY;
                    my.vfx.place.start();
                    this.sound.play("place", {volume: 0.4});
                    this.money -= this.towerPrice;
                }
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

        // sell button
        this.sellButton = this.add.rectangle(1390, 570, 160, 120, baseColor);
        this.sellButton.setInteractive();
        this.sellButton.setStrokeStyle(4, pressColor);
        this.sellButton.on("pointerover", () => {
            this.sellButton.fillColor = hoverColor;
            this.rangeCircle.x = this.tileX;
            this.rangeCircle.y = this.tileY;
        });
        this.sellButton.on("pointerup", () => {
            this.sellButton.fillColor = baseColor;
            for (const turret of this.turretGroup.getChildren()) {
                if (this.tileX === turret.x && this.tileY === turret.y) {
                    turret.destroy();
                }
            }
            this.selectedTower.destroy();
            this.money += 3;
            this.sound.play("sell");
            my.vfx.death.x = this.tileX;
            my.vfx.death.y = this.tileY;
            my.vfx.death.start();
        });
        this.sellButton.on("pointerdown", () => {
            this.sellButton.fillColor = pressColor;
            // this.sellButton.setStrokeStyle(2, 0x000000);
        });
        this.sellButton.on("pointerout", () => {
            this.sellButton.fillColor = baseColor;
            this.rangeCircle.visible = false;
        });

        // enemy types [texture, spawn speed, path duration, reward]
        const PLANE = [271,3,20000,1];
        const PLANE2 = [270, 1, 15000,2];

        // waves [enemy type, number of enemy, enemy speed]
        let WAVE1 = [
            [PLANE, 5]
        ];
        let WAVE2 = [
            [PLANE, 2],
            [PLANE2, 3],
            [PLANE, 3]
        ];
        let WAVE3 = [
            [PLANE2, 10],
            [PLANE, 5]
        ];
        let WAVE4 = [
            [PLANE2, 25]
        ]
        this.waves = [WAVE1, WAVE2, WAVE3, WAVE4];

        // wave start button

        this.waveOngoing = false;
        this.waveCounter = 0;
        this.wave = this.waves[0];
        this.buttonColor = startColor

        this.waveButton = this.add.rectangle(1390, 860, 160, 120, startColor);
        this.waveButton.setInteractive();
        this.waveButton.setStrokeStyle(4, 0x666666);
        this.waveButton.on('pointerover', () => {
            this.waveButton.fillColor = hoverColor;
        });
        this.waveButton.on('pointerup', () => {
            if (!this.waveOngoing) {
                // start wave
                // load enemies
                let wave = this.waves[this.waveCounter];
                this.wave = wave;
                for (const group of wave) {
                    for (let spawns = 0; spawns < group[1]; spawns++) { //group[1] is the number of enemies that will spawn
                        let newEnemy = this.add.follower(this.enemyPath, this.enemyPath.startPoint.x, this.enemyPath.startPoint.y, "tilemap_sheet", group[0][0]);
                        newEnemy.speed = group[0][2];
                        newEnemy.reward = group[0][3];
                        newEnemy.visible = false;
                        this.enemyArray.push(newEnemy);
                    }
                }
                this.waveOngoing = true;
                this.sound.play("waveStart");
            }
        });
        this.waveButton.on('pointerdown', () => {
            this.waveButton.fillColor = pressColor;
        });
        this.waveButton.on('pointerout', () => {
            this.waveButton.fillColor = this.buttonColor;
        });

        // text
        this.infoText = this.add.text(
            game.config.width - 200,
            this.cameras.main.y + 12,
            "",
            {
                fontFamily: 'Impact',
                fontSize: 60,
                stroke: '#333333',
                strokeThickness: 10
            }
        );

        this.sellText = this.add.text(
            game.config.width - 190,
            game.config.height/2 + 45,
            "Sell Tower\n(+$3)",
            {
                fontFamily: 'Impact',
                fontSize: 35,
                stroke: '#333333',
                strokeThickness: 10
            }
        );

        this.buttonText = this.add.text(
            game.config.width - 190,
            game.config.height/2 + 170,
            "Buy Tower\n($5)\n\n\nStart wave",
            {
                fontFamily: 'Impact',
                fontSize: 35,
                stroke: '#333333',
                strokeThickness: 10
            }
        );

        // resources
        this.lives = 10;
        this.money = 10;

        // counters
        this.enemySpawnCounter = 0;
    }

    update(time, delta) {
        this.enemySpawnCounter--;

        // update text fields
        this.minutes = Math.floor(this.gameTimer / 60);
        this.seconds = this.gameTimer % 60;
        this.infoText.setText(
            "Money\n$" + this.money +
            "\n\nLives\n" + this.lives
        );
        
        // check if enemies go offscreen
        for (const enemy of this.enemyArray) {
            if (enemy.y > 960) {
                this.enemyArray = this.enemyArray.filter(x => x !== enemy);
                enemy.destroy();
                // TODO: remove a life from the player
                this.lives--;
                this.sound.play("lose", {volume: 0.5});
            }
        }

        if (this.selectedTower) {
            this.sellButton.visible = true;
            this.sellText.visible = true;
        }
        else {
            this.sellButton.visible = false;
            this.sellText.visible = false;
        }

        // wave ends
        if (this.enemyArray.length === 0 && this.waveOngoing) {
            this.waveCounter++;
            this.waveOngoing = false;
            this.waveButton.fillColor = 0x004400;
        }

        // ongoing wave
        if (this.waveOngoing && this.enemySpawnCounter < 0) {
            for (const enemy of this.enemyArray) {
                if (!enemy.visible && enemy.active) {
                    enemy.startFollow({
                        from: 0,
                        to: 1,
                        delay: 0,
                        duration: enemy.speed,
                        ease: 'Linear',
                        repeat: -1,
                        yoyo: false,
                        rotateToPath: true
                    });
                    enemy.visible = true;
                    break;
                }
            }
            this.buttonColor = 0x440000;
            this.enemySpawnCounter = this.wave[0][0][1] * delta;
        }

        // towers search for enemies (rotation)
        for (const turret of this.turretGroup.getChildren()) {
            turret.search();
        }

        // check for collisions between bullets and enemies
        for (let bullet of this.bulletGroup.getChildren()) {
            for (let enemy of this.enemyArray) {
                if (this.collides(enemy, bullet) && bullet.active && enemy.active) {
                    my.vfx.death.x = enemy.x;
                    my.vfx.death.y = enemy.y;
                    my.vfx.death.start();
                    enemy.visible = false;
                    enemy.active = false;
                    this.enemyArray = this.enemyArray.filter(item => item !== enemy);
                    bullet.visible = false;
                    bullet.active = false;
                    this.sound.play("death", {volume: 0.4});
                    this.money += enemy.reward;
                }
            }
        }

        if (this.lives <= 0) {
            this.scene.start("lose");
        }

        if (this.waveCounter == 4) {
            this.scene.start("win");
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

    restart() {
        this.waveCounter = 0;
        this.money = 10;
        this.lives = 10;
    }
}