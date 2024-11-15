# Shape Verification Challenge

A dynamic, interactive CAPTCHA alternative that verifies users through a shape-matching mini-game. Users must identify and click on moving shapes within a time limit to prove they're human.

## Features

- Interactive shape-matching gameplay
- Moving shapes with collision detection
- Responsive design for both desktop and mobile
- Timed challenges
- Score tracking
- Visual feedback for success/failure states
- Blur effects and smooth animations

## Game Rules

- Players must match 3 shapes within 30 seconds
- Shapes move continuously in random directions
- Shape names are displayed for 2 seconds
- Available shapes: triangle, square, circle, rectangle

## Configuration

The following constants can be modified in the code:

```typescript
const SPEED = 0.8;              // Movement speed of shapes
const SHAPE_SIZE = 48;          // Size of shapes in pixels
const GAME_TIME = 30;           // Game duration in seconds
const REQUIRED_SCORE = 3;       // Score needed to pass verification
```

## Event Callbacks

The game integrates with GotCHA's verification system through these callbacks:
- `onChallengeResponse(success: boolean)`
- `onChallengeExpired()`
- `onChallengeError()`

## Styling

The game uses Tailwind CSS for styling. The main container is responsive and will adapt to different screen sizes, with a maximum width of 400px.
