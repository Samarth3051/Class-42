class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

    this.leadeboardTitle = createElement("h2");

    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
    this.playermoving=false;
    this.image=loadImage("./assets/fuel.png");
    this.leftkeyactive=false;
    this.blast=false;

  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;
    car1.addImage("blast",blastImage);

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;
    car2.addImage("blast",blastImage);

    cars = [car1, car2];

    fuels = new Group();
    powerCoins = new Group();
    obstacles= new Group();

    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 1300, image:obstacle1Image },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2Image },
      { x: width / 2, y: height - 2800, image: obstacle2Image },
      { x: width / 2 - 180, y: height - 3300, image:obstacle1Image },
      { x: width / 2 + 180, y: height - 3300, image:obstacle2Image },
      { x: width / 2 + 250, y: height - 3800, image:obstacle2Image },
      { x: width / 2 - 150, y: height - 4300, image:obstacle1Image },
      { x: width / 2 + 250, y: height - 4800, image:obstacle2Image},
      { x: width / 2, y: height - 5300, image: obstacle1Image},
      { x: width / 2 - 180, y: height - 5500, image:obstacle2Image }

    ];

    // Adding fuel sprite in the game
    this.addSprites(fuels, 4, fuelImage, 0.02);

    // Adding coin sprite in the game
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);

    this.addSprites(obstacles,obstaclesPositions.length,obstacle1Image,0.05,obstaclesPositions);
  }

  addSprites(spriteGroup, numberOfSprites, spriteImage, scale,positions=[]) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;
      if(positions.length>0){
        x=positions[i].x;
        y=positions[i].y;
        spriteImage=positions[i].image
  
      }
      else{
        x = random(width / 2 + 150, width / 2 - 150);
        y = random(-height * 4.5, height - 400);
      }
      

      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }
  handlefuel(index){
    //addfuel
    car[index-1].overlap(fuels,function(collector,collected){
      player.fuel=185
      collected.remove()
      
    });
    //Reduce car fuel
    if(player.fuel>0&&this.playermoving){
      player.fuel-=0.3;

    }
    if(player.fuel<0){
      gameState:2;
      this.gameOver();
      
      
    }
  }
    gameOver(){
      swal({
        title: `Awesome!${"\n"}Rank${"\n"}${player.rank}`,
        text: "You reached the finish line successfully",
        imageUrl:
          "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
        imageSize: "100x100",
        confirmButtonText: "Ok"
      });
    }
  

      
    
  


  
  handlePowercoins(index){""
    cars[index-1].overlap(powerCoins,function(collector,collected){
      player.score+=21;
      player.update();
      collected.remove();
    })

  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    //C39
    this.resetTitle.html("Reset Game");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leadeboardTitle.html("Leaderboard");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();
    

    Player.getPlayersInfo();
    Player.getcarAtEnd();
    this.showLife();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

      this.showLeaderboard();

      //index of the array
      var index = 0;
      for (var plr in allPlayers) {
        //add 1 to the index for every loop
        index = index + 1;

        //use data form the database to display the cars in x and y direction
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;
        //save the value of player.life in a variable
        var currentLife=allPlayers[plr].life;
        if(currentLife<=0){
          cars[index-1].changeImage("blast");
          cars[index-1].scale=0.3;
        }

        cars[index - 1].positionX = x;
        cars[index - 1].positionY = y;

        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.handlefuel(index);
          this.handlePowercoins(index);
          this.handleObstacleCollision(index);
          this.handleCarACollisionwithCarB(index);
          if(player.life<=0){
            this.blast=true;
            this.playermoving=false;
          }

          // Changing camera position in y direction
          camera.position.y = cars[index - 1].position.y;
        }
      }

      // handling keyboard events
      this.handlePlayerControls();
      const finishline=height*6-100;
      if(player.positionY>finishline){
        gameState=2;
        player.rank+=1;
        player.updatecarsAtEnd(player.rank);
        player.update();
        this.showrank();
        
      }
      if(keyIsDown(LEFT_ARROW) && player.position>width/3-50){
        this.leftkeyactive=true;
        player.positionX-=5;
        player.update();

      }
      if(keyIsDown(RIGHT_ARROW) && player.positionX<width/2+300){
        this.leftkeyactive=false;
        player.positionX+=5;
        player.update();
      }
    // if(keyIsDown(UP_ARROW)){
        
     // }

      drawSprites();
    }
  }

  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        players: {},
        carsAtEnd:0
      });
      window.location.reload();
    });
  }

  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);
    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      // &emsp;    This tag is used for displaying four spaces.
      leader1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;

      leader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }

    if (players[1].rank === 1) {
      leader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;

      leader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  handlePlayerControls() {
    if(!this.blast){
    if (keyIsDown(UP_ARROW)) {
      this.playermoving=true;
      player.positionY += 10;
      player.update();
      
    }

    if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
      player.positionX -= 5;
      player.update();
    }

    if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
      player.positionX += 5;
      player.update();
    }
  }
  }
  showrank(){
    swal({
      title: `Awesome!${"\n"}Rank${"\n"}${player.rank}`,
      text:"You have reached the finish line successfully",
      imageURL:"https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-gam e/master/assets/cup.png",
      imageSize:"100x100",
      confirmButtontext:"Ok"



    })
  }
  showLife(){
    push();
    image(fuelImage, width / 2 - 130, height - player.positionY - 100, 20, 20);
    fill("white");
    rect(width / 2 - 100, height - player.positionY - 100, 185, 20);
    fill("#ffc400");
    rect(width / 2 - 100, height - player.positionY - 100, player.fuel, 20);
    noStroke();
   pop();
  }
  handleObstacleCollision(index){
    if(cars[index-1].collide(obstacles)){
      if(this.leftkeyactive){
        player.positionX+=100;
      }
      else{
        player.positionX-=100;
      }
      if(player.life>0){
        player.life=player.life-185/4;
      }
      player.update();
    }
  }
  handleCarACollisionwithCarB(index){
    if(index===1){
      if(cars[index-1].collide(cars)[1]){
        if(this.leftkeyactive){
          player.positionX+=100;
        }
        else{
          player.positionX-=100;
        }
        //reduce player life
        if(player.life>0){
          player.life-=185/4
        }
        player.update();
      }
    }
    if(index===2){
      if(cars[index-1].collide(cars)[0]){
        if(this.leftkeyactive){
          player.positionX+=100;
        }
        else{
          player.positionX-=100;
        }
        //reduce player life
        if(player.life>0){
          player.life-=185/4
        }
        player.update();
      }
  }
  }
  end(){
    console.log("gameOver");
  }
  }
