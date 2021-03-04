const {
  Client,
  Controller,
  Color,
  Vector3,
  Manager,
  quickChats,
  Physics,
  BallState,
  GameState,
} = require("EasyRLBot");

class ExampleBot extends Client {
  constructor(...args) {
    super(...args); // Do not change this except if you know what you are doing.
  }
  getOutput(gameTickPacket, fieldInfo, ballPrediction) {
    let controller = new Controller(); // Create a new controller

    if (!ballPrediction || !gameTickPacket.players[this.botIndex]) return; // Return if needed information is not provided

    let targetLocation = gameTickPacket.ball.physics.location; // Set targeted location to ball
    let carLocation = gameTickPacket.players[this.botIndex].physics.location;
    let carRotation = gameTickPacket.players[this.botIndex].physics.rotation;

    let botToTargetAngle = Math.atan2(
      targetLocation.y - carLocation.y,
      targetLocation.x - carLocation.x
    );
    let botFrontToTargetAngle = botToTargetAngle - carRotation.yaw;
    let targetDistance2D = Math.round(
      Math.sqrt(
        Math.pow(targetLocation.x - carLocation.x, 2) +
          Math.pow(targetLocation.y - carLocation.y, 2)
      )
    );

    // Steer the car in the targeted direction
    if (botFrontToTargetAngle > 0) {
      controller.steer = 1;
    } else {
      controller.steer = -1;
    }

    // If distance to target is more than 2500 then boost
    if (targetDistance2D > 2500) {
      controller.boost = true;
    }

    // Drive forward
    controller.throttle = 1;

    // Send controller to RLBot
    this.controller.sendInput(controller);
  }
}

let manager = new Manager(
  ExampleBot,
  require("./config/AgentConfig.json").port
);
