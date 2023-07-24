enum Direction {
  DOWN = 10,
  UP = Direction.DOWN * -1,
  RIGHT = 1,
  LEFT = -1
}

namespace Direction {
  export function areOpposite(direction_one: Direction, direction_two: Direction): boolean {
    return direction_one + direction_two == 0;
  }

  export function getOpposite(direction: Direction) : Direction {
    return direction * -1;
  }

  export function xShift(direction: Direction) : number {
    return direction % 10;
  }

  export function yShift(direction: Direction) : number {
    return Math.round(direction / 10);
  }

  export function angle(direction1: Direction, direction2: Direction) : number {
    if ((direction1 == Direction.DOWN && direction2 == Direction.LEFT) || (direction1 == Direction.RIGHT && direction2 == Direction.UP)) {
      return 90;
    } else if ((direction1 == Direction.LEFT && direction2 == Direction.UP) || (direction1 == Direction.DOWN && direction2 == Direction.RIGHT)) {
      return 180;
    } else if ((direction1 == Direction.UP && direction2 == Direction.RIGHT) || (direction1 == Direction.LEFT && direction2 == Direction.DOWN)) {
      return 270;
    } else {
      return 0;
    }

  }
}

export { Direction };