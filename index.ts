import {
  Client,
  Manager,
  Controller,
  GameTickPacket,
  FieldInfo,
  BallPrediction,
} from "EasyRLBot";

class ExampleBot extends Client {
  constructor(botIndex: number, ...args) {
    super(botIndex, ...args); // Do not change this except if you know what you are doing.
  }
  getOutput(
    gameTickPacket: GameTickPacket,
    fieldInfo: FieldInfo,
    ballPrediction: BallPrediction
  ) {
    let controller = new Controller(); // Create a new controller

    if (!ballPrediction || !gameTickPacket.players[this.botIndex]) return; // Return if needed information is not provided

    // Define target and car physics
    let target = gameTickPacket.ball.physics; // Set targeted location to ball
    let car = gameTickPacket.players[this.botIndex].physics;

    // Calculate angle
    let botToTargetAngle = Math.atan2(
      target.location.y - car.location.y,
      target.location.x - car.location.x
    );

    // Angle relative to car
    let botFrontToTargetAngle = botToTargetAngle - car.rotation.yaw;

    // Correct angle
    if (botFrontToTargetAngle > Math.PI) botFrontToTargetAngle -= 2 * Math.PI;
    if (botFrontToTargetAngle < -Math.PI) botFrontToTargetAngle += 2 * Math.PI;

    // Calculate distance in 2D between car and ball
    let targetDistance2D = Math.round(
      Math.sqrt(
        Math.pow(target.location.x - car.location.x, 2) +
          Math.pow(target.location.y - car.location.y, 2)
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
