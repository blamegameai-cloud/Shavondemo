        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const gameOverOverlay = document.getElementById('gameOverOverlay');
        const gameOverScoreDisplay = document.getElementById('gameOverScore');
        const congratulationsOverlay = document.getElementById('congratulationsOverlay');
        const congratulationsScoreDisplay = document.getElementById('congratulationsScore');

        // Game configuration
        const GRID_ROWS = 15;
        const GRID_COLS = 8;
        // Changed to BLOCK_W and BLOCK_H to allow non-square tiles
        let BLOCK_W = 0;
        let BLOCK_H = 0;
        const COLORS = [
            '#FF6F61', // Coral
            '#6B5B95', // Amethyst
            '#88B04B', // Pistachio
            '#92A8D1'  // Serenity Blue
        ];
        const MAX_MOVES = 25;
        const GAME_END_DELAY = 7000; // 7 seconds in milliseconds

        // Background images (using placeholder images, replace with your actual images)
        // For production, ensure these URLs are stable or serve them from your own assets.
        const BACKGROUND_IMAGES = [
            'img/img1a.jpg', // Place Your Image here
            'img/lure1.jpg', // Place Your Image here
            'img/more1.jpg', // Place Your Image here
            'img/sway1.jpg', // Place Your Image here
            'img/slide4.jpg', // Place Your Image here
            'img/img2a.jpg', // Place Your Image here
            'img/sway2.jpg', // Place Your Image here
            'img/more2.jpg', // Place Your Image here
            'img/lure7.jpg', // Place Your Image here
            'img/img2b.jpg', // Place Your Image here
            'img/slide5.jpg', // Place Your Image here
            'img/sway3.jpg', // Place Your Image here
            'img/lure2.jpg', // Place Your Image here
            'img/more3.jpg', // Place Your Image here
            'img/sway4.jpg', // Place Your Image here
            'img/slide6.jpg', // Place Your Image here
            'img/img3a.jpg', // Place Your Image here
            'img/slide3.jpg', // Place Your Image here
            'img/sway5.jpg', // Place Your Image here
            'img/lure6.jpg', // Place Your Image here
            'img/more4.jpg', // Place Your Image here
            'img/sway6.jpg', // Place Your Image here
            'img/img3b.jpg', // Place Your Image here
            'img/more5.jpg', // Place Your Image here
            'img/sway7.jpg', // Place Your Image here
            'img/slide7.jpg', // Place Your Image here
            'img/lure3.jpg', // Place Your Image here
            'img/more7.jpg', // Place Your Image here
            'img/img4a.jpg', // Place Your Image here
            'img/more8.jpg', // Place Your Image here
            'img/lure4.jpg', // Place Your Image here
            'img/slide8.jpg', // Place Your Image here
            'img/img4b.jpg', // Place Your Image here
            'img/lure5.jpg', // Place Your Image here
            'img/slide1.jpg', // Place Your Image here
            'img/sway8.jpg', // Place Your Image here
            'img/slide2.jpg', // Place Your Image here
            'img/lure8.jpg', // Place Your Image here
            'img/img1b.jpg', // Place Your Image here  
        ];
        let currentImageIndex = 0;
        let backgroundImage = new Image();

        // Game state variables
        let grid = [];
        let score = 0;
        let moves = 0;
        let gameOver = false;
        let gameActive = false; // To prevent interaction during delays/overlays

        // Animation specific variables
        let animationFrameId = null;
        let isAnimating = false; // Prevents new clicks while animations are playing
        let blockIdCounter = 0; // For unique block IDs

        // Animation timing constants (in milliseconds)
        const ANIMATION_DURATION_MS = 250; // Total duration for movement animations
        const FADE_DURATION_MS = 200;    // Total duration for fade out

        // Global offsets for drawing blocks to center them within the canvas
        // These are now always 0 as blocks will fill the canvas
        let offsetX = 0;
        let offsetY = 0;

        // Placeholder for sound effects
        function playClickSound() {
            console.log("Play: Tile Click Sound");
            // To add your own click sound:
            const audio = new Audio('sounds/click1.mp3');
            audio.play();
        } 

        function playClearSound() {
            console.log("Play: Successful Clear Sound");
            // To add your own clear sound:
            const audio = new Audio('sounds/clear1.mp3');
            audio.play();
        }


        /**
         * Updates the score display on the UI.
         */
        function updateScoreDisplay() {
            scoreDisplay.textContent = `Score: ${score}`;
        }

        /**
         * Updates the score based on the number of blocks removed in a move.
         * @param {number} numRemoved - The number of blocks removed.
         */
        function updateScore(numRemoved) {
            // Scoring mechanism: More blocks removed in one go give exponentially more points.
            score += numRemoved * numRemoved;
            updateScoreDisplay();
        }

        // Helper to create a new block object
        function createBlock(r, c, color) {
            const block = {
                color: color,
                id: blockIdCounter++, // Assign unique ID
                gridR: r, // Logical row in the grid
                gridC: c, // Logical column in the grid
                // Initial draw and target positions now use BLOCK_W and BLOCK_H directly
                drawX: c * BLOCK_W,
                drawY: r * BLOCK_H,
                targetX: c * BLOCK_W,
                targetY: r * BLOCK_H,
                alpha: 1, // Opacity for fading
                state: 'idle', // 'idle', 'removing', 'moving', 'newlyGenerated'
                animationStartTime: 0 // Timestamp when animation started for this block
            };
            return block;
        }

        /**
         * Initializes the game state, grid, and UI.
         */
        function initGame() {
            // Hide any overlays
            gameOverOverlay.classList.remove('visible');
            congratulationsOverlay.classList.remove('visible');

            // Reset game state
            score = 0;
            moves = 0;
            gameOver = false;
            gameActive = true;
            isAnimating = false; // Ensure no ongoing animations from previous game

            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }

            // Set canvas dimensions based on container and aspect ratio, and calculate BLOCK_W/H
            resizeCanvas();

            // Initialize grid with random colors, creating block objects
            grid = Array(GRID_ROWS).fill(null).map((_, r) =>
                Array(GRID_COLS).fill(null).map((_, c) => createBlock(r, c, getRandomColor()))
            );

            // Load the current background image for the new game
            nextBackgroundImage(); // Call this here to change background for new game

            // Update UI displays
            updateScoreDisplay();

            // Add event listener for clicks on the canvas
            canvas.onclick = handleCanvasClick;

            // Initial draw (animateFrame will handle starting the animation loop if needed)
            draw();
        }

        /**
         * Resizes the canvas to fit its container while maintaining the target aspect ratio (1080x1920)
         * and ensures blocks perfectly fill this target area.
         */
        function resizeCanvas() {
            const container = document.querySelector('.game-container');
            const headerHeight = document.querySelector('.game-header').offsetHeight;
            const containerPadding = 20 * 2; // 20px padding top/bottom in .game-container
            const availableHeight = container.clientHeight - headerHeight - containerPadding;
            const availableWidth = container.clientWidth - containerPadding;

            const targetAspectRatio = 1080 / 1920; // Desired aspect ratio for the playable area (canvas)

            let newCanvasWidth, newCanvasHeight;

            // Calculate canvas dimensions based on the target aspect ratio and available space
            if (availableWidth / availableHeight > targetAspectRatio) {
                // Container is wider than target aspect ratio, limit by height
                newCanvasHeight = availableHeight;
                newCanvasWidth = newCanvasHeight * targetAspectRatio;
            } else {
                // Container is taller or same aspect ratio, limit by width
                newCanvasWidth = availableWidth;
                newCanvasHeight = newCanvasWidth / targetAspectRatio;
            }

            // Ensure canvas dimensions are integers
            canvas.width = Math.floor(newCanvasWidth);
            canvas.height = Math.floor(newCanvasHeight);

            // Calculate block dimensions to perfectly fill the canvas area.
            // This will result in non-square blocks if the grid aspect ratio doesn't match the canvas.
            BLOCK_W = canvas.width / GRID_COLS;
            BLOCK_H = canvas.height / GRID_ROWS;

            // No offsets needed, as BLOCK_W * GRID_COLS will now directly equal canvas.width
            // and BLOCK_H * GRID_ROWS will directly equal canvas.height.
            offsetX = 0;
            offsetY = 0;

            // Update drawX/Y and targetX/Y for existing blocks based on new BLOCK_W and BLOCK_H
            if (grid.length > 0) {
                for (let r = 0; r < GRID_ROWS; r++) {
                    for (let c = 0; c < GRID_COLS; c++) {
                        const block = grid[r][c];
                        if (block) {
                            block.drawX = block.gridC * BLOCK_W; // Use BLOCK_W
                            block.drawY = block.gridR * BLOCK_H; // Use BLOCK_H
                            block.targetX = block.gridC * BLOCK_W;
                            block.targetY = block.gridR * BLOCK_H;
                            block.state = 'idle'; // Reset state to prevent re-animating on resize
                        }
                    }
                }
                draw(); // Redraw immediately after resize
            }
        }


        /**
         * Loads the background image for the current level.
         */
        function loadBackgroundImage() {
            backgroundImage.src = BACKGROUND_IMAGES[currentImageIndex];
            backgroundImage.onload = () => {
                draw(); // Redraw once image is loaded
            };
            backgroundImage.onerror = () => {
                console.error('Failed to load background image:', BACKGROUND_IMAGES[currentImageIndex]);
                ctx.fillStyle = '#AEC6CF'; // Default fallback color
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                draw();
            };
        }

        /**
         * Cycles to the next background image in the array.
         */
        function nextBackgroundImage() {
            currentImageIndex = (currentImageIndex + 1) % BACKGROUND_IMAGES.length;
            loadBackgroundImage();
        }

        /**
         * Gets a random color from the predefined COLORS array.
         * @returns {string} A hex color code.
         */
        function getRandomColor() {
            return COLORS[Math.floor(Math.random() * COLORS.length)];
        }

        /**
         * Draws the entire game state, including background, blocks, and UI elements.
         */
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw background image if loaded, scaling to fit the canvas dimensions
            if (backgroundImage.complete && backgroundImage.naturalWidth !== 0) {
                ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
            } else {
                // Fallback if image not loaded or failed
                ctx.fillStyle = '#f0f2f5'; // Light gray fallback background for canvas
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Draw blocks
            for (let r = 0; r < GRID_ROWS; r++) {
                for (let c = 0; c < GRID_COLS; c++) {
                    const block = grid[r][c];
                    if (block) {
                        ctx.globalAlpha = block.alpha; // Set alpha for drawing
                        ctx.fillStyle = block.color;
                        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                        ctx.lineWidth = 1;
                        const borderRadius = 5;

                        // Calculate size for shrinking animation for width and height independently
                        let currentBlockWidth = BLOCK_W;
                        let currentBlockHeight = BLOCK_H;
                        if (block.state === 'removing') {
                            const elapsed = performance.now() - block.animationStartTime;
                            const progress = Math.min(1, elapsed / FADE_DURATION_MS);
                            currentBlockWidth = BLOCK_W * (1 - progress); // Shrink width
                            currentBlockHeight = BLOCK_H * (1 - progress); // Shrink height
                        }

                        // Adjust x, y to draw from the center of the shrinking block, considering offsets
                        // Offsets are 0, so it's just block.drawX + (BLOCK_W - currentBlockWidth) / 2
                        const drawX_centered = block.drawX + (BLOCK_W - currentBlockWidth) / 2;
                        const drawY_centered = block.drawY + (BLOCK_H - currentBlockHeight) / 2;


                        ctx.beginPath();
                        ctx.moveTo(drawX_centered + borderRadius, drawY_centered);
                        ctx.lineTo(drawX_centered + currentBlockWidth - borderRadius, drawY_centered);
                        ctx.quadraticCurveTo(drawX_centered + currentBlockWidth, drawY_centered, drawX_centered + currentBlockWidth, drawY_centered + borderRadius);
                        ctx.lineTo(drawX_centered + currentBlockWidth, drawY_centered + currentBlockHeight - borderRadius);
                        ctx.quadraticCurveTo(drawX_centered + currentBlockWidth, drawY_centered + currentBlockHeight, drawX_centered + currentBlockWidth - borderRadius, drawY_centered + currentBlockHeight);
                        ctx.lineTo(drawX_centered + borderRadius, drawY_centered + currentBlockHeight);
                        ctx.quadraticCurveTo(drawX_centered, drawY_centered + currentBlockHeight, drawX_centered, drawY_centered + currentBlockHeight - borderRadius);
                        ctx.lineTo(drawX_centered, drawY_centered + borderRadius);
                        ctx.quadraticCurveTo(drawX_centered, drawY_centered, drawX_centered + borderRadius, drawY_centered);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                        ctx.globalAlpha = 1; // Reset alpha for next draws
                    }
                }
            }
        }

        /**
         * Handles click events on the game canvas.
         * @param {MouseEvent} event The click event.
         */
        function handleCanvasClick(event) {
            if (gameOver || !gameActive || isAnimating) return; // Prevent interaction during delays/animations

            const rect = canvas.getBoundingClientRect();
            // Adjust click coordinates to be relative to the canvas itself
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            // Calculate column and row using BLOCK_W and BLOCK_H
            const col = Math.floor(x / BLOCK_W);
            const row = Math.floor(y / BLOCK_H);

            if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
                const clickedBlock = grid[row][col];
                if (!clickedBlock || clickedBlock.state === 'removing') return; // Clicked on empty space or already removing

                const group = findGroup(row, col, clickedBlock.color);

                if (group.length > 1) { // Only remove if a group of 2 or more is found
                    isAnimating = true; // Lock interactions

                    // Play click sound
                    playClickSound();

                    // Phase 1: Mark blocks for removal animation
                    group.forEach(coords => {
                        const block = grid[coords.row][coords.col];
                        if (block) {
                            block.state = 'removing';
                            block.animationStartTime = performance.now();
                        }
                    });

                    moves++; // Increment moves
                    updateScore(group.length); // Update score

                    // Start the main animation loop if not already running
                    if (!animationFrameId) {
                        animationFrameId = requestAnimationFrame(animateFrame);
                    }
                }
            }
        }

        /**
         * The main animation loop for the game. Handles state transitions and drawing.
         * @param {DOMHighResTimeStamp} timestamp - The current time in milliseconds.
         */
        function animateFrame(timestamp) {
            let animationsRemaining = false;
            let logicalUpdateTriggeredThisFrame = false;

            // First pass: Update current drawing positions/alphas based on animation states
            // Also, identify blocks that are fully removed and trigger logical updates.
            const blocksToRemoveLogically = [];

            for (let r = 0; r < GRID_ROWS; r++) {
                for (let c = 0; c < GRID_COLS; c++) {
                    const block = grid[r][c];
                    if (block) {
                        if (block.state === 'removing') {
                            const elapsed = timestamp - block.animationStartTime;
                            const progress = Math.min(1, elapsed / FADE_DURATION_MS);
                            block.alpha = 1 - progress;

                            if (progress >= 1) {
                                blocksToRemoveLogically.push({ r: r, c: c }); // Mark for logical removal
                            } else {
                                animationsRemaining = true;
                            }
                        } else if (block.state === 'moving' || block.state === 'newlyGenerated') {
                            const elapsed = timestamp - block.animationStartTime;
                            const progress = Math.min(1, elapsed / ANIMATION_DURATION_MS);

                            // Interpolate drawX and drawY using BLOCK_W and BLOCK_H
                            block.drawX = block.currentX + (block.targetX - block.currentX) * progress;
                            block.drawY = block.currentY + (block.targetY - block.currentY) * progress;

                            // Snap to target if very close or animation is complete
                            if (progress >= 1 || (Math.abs(block.drawX - block.targetX) < 0.1 && Math.abs(block.drawY - block.targetY) < 0.1)) {
                                block.drawX = block.targetX;
                                block.drawY = block.targetY;
                                block.state = 'idle'; // Animation complete for this block
                            } else {
                                animationsRemaining = true;
                            }
                        }
                        // If block is 'idle', no animation on drawX/Y, it stays at targetX/Y
                    }
                }
            }

            // Perform logical removal (setting grid[r][c] to null) only AFTER the iteration
            if (blocksToRemoveLogically.length > 0) {
                blocksToRemoveLogically.forEach(({ r, c }) => {
                    grid[r][c] = null;
                });
                logicalUpdateTriggeredThisFrame = true; // Flag to perform logical updates
                playClearSound(); // Play clear sound when blocks are logically removed
            }

            // If logical updates are needed (meaning blocks just finished removal animation)
            if (logicalUpdateTriggeredThisFrame) {
                performLogicalGridUpdates();
                // After logical updates, new blocks might be 'moving' or 'newlyGenerated',
                // so ensure the animation loop continues.
                animationsRemaining = true;
            }

            draw(); // Redraw the canvas with the updated block positions/alphas

            if (animationsRemaining) {
                animationFrameId = requestAnimationFrame(animateFrame);
            } else {
                // All animations for the current sequence are complete
                isAnimating = false; // Allow new clicks
                animationFrameId = null; // Stop the animation loop
                checkGameEndConditions(); // Check if game is over
            }
        }

        /**
         * Recursively finds all adjacent blocks of the same color.
         * @param {number} r - The current row.
         * @param {number} c - The current column.
         * @param {string} color - The target color to match.
         * @param {Array<Array<boolean>>} visited - A 2D array to keep track of visited cells.
         * @param {Array<Object>} group - An array to store the found group coordinates.
         * @returns {Array<Object>} An array of {row, col} objects representing the group.
         */
        function findGroup(r, c, color, visited = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(false)), group = []) {
            // Boundary checks and color match check
            if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS || visited[r][c] || !grid[r][c] || grid[r][c].color !== color || grid[r][c].state === 'removing') {
                return group;
            }

            visited[r][c] = true;
            group.push({ row: r, col: c });

            // Check adjacent cells (up, down, left, right)
            findGroup(r - 1, c, color, visited, group); // Up
            findGroup(r + 1, c, color, visited, group); // Down
            findGroup(r, c - 1, color, visited, group); // Left
            findGroup(r, c + 1, color, visited, group); // Right

            return group;
        }

        /**
         * Sets the state of blocks to 'removing' and records their animation start time.
         * Actual nulling of blocks happens in animateFrame after fading.
         * @param {Array<Object>} group - The array of {row, col} objects to remove.
         */
        function removeGroup(group) {
            group.forEach(blockCoords => {
                const block = grid[blockCoords.row][blockCoords.col];
                if (block) {
                    block.state = 'removing';
                    block.animationStartTime = performance.now();
                }
            });
        }

        /**
         * Applies gravity logically: blocks fall down to fill empty spaces.
         * Updates block's logical gridR/gridC and sets animation properties.
         */
        function applyGravityLogical() {
            for (let c = 0; c < GRID_COLS; c++) {
                let emptySpaces = 0;
                // Iterate from bottom up
                for (let r = GRID_ROWS - 1; r >= 0; r--) {
                    const block = grid[r][c];
                    if (block === null) {
                        emptySpaces++;
                    } else if (emptySpaces > 0) {
                        // This block needs to fall
                        const oldR = block.gridR;
                        const oldC = block.gridC;

                        // Update logical position in the grid array
                        grid[r + emptySpaces][c] = block;
                        grid[r][c] = null;

                        // Update block's internal logical position
                        block.gridR = r + emptySpaces;

                        // Set animation properties using BLOCK_W and BLOCK_H
                        block.currentX = oldC * BLOCK_W;
                        block.currentY = oldR * BLOCK_H;
                        block.targetX = block.gridC * BLOCK_W;
                        block.targetY = block.gridR * BLOCK_H;
                        block.state = 'moving';
                        block.alpha = 1; // Ensure block is visible if falling
                        block.animationStartTime = performance.now();
                    }
                }
            }
        }

        /**
         * Fills empty spaces at the top of the grid with new random blocks.
         * Sets animation properties for new blocks to fall from above.
         */
        function fillNewBlocksLogical() {
            for (let c = 0; c < GRID_COLS; c++) {
                for (let r = 0; r < GRID_ROWS; r++) {
                    if (grid[r][c] === null) {
                        const newBlock = createBlock(r, c, getRandomColor());
                        grid[r][c] = newBlock;

                        // Set animation properties for new block to fall from above
                        // Start drawing position from above the canvas
                        newBlock.currentX = newBlock.gridC * BLOCK_W;
                        newBlock.currentY = -BLOCK_H * (GRID_ROWS - newBlock.gridR); // Start well above its target position using BLOCK_H
                        newBlock.targetX = newBlock.gridC * BLOCK_W;
                        newBlock.targetY = newBlock.gridR * BLOCK_H;
                        newBlock.state = 'newlyGenerated';
                        newBlock.alpha = 1;
                        newBlock.animationStartTime = performance.now();
                    }
                }
            }
        }

        /**
         * Shifts columns to the left if an entire column is empty.
         * Updates block's logical gridC and sets animation properties.
         */
        function shiftColumnsLogical() {
            let emptyColumns = 0;
            // Iterate columns from left to right
            for (let c = 0; c < GRID_COLS; c++) {
                let columnIsEmpty = true;
                for (let r = 0; r < GRID_ROWS; r++) {
                    if (grid[r][c] !== null) {
                        columnIsEmpty = false;
                        break;
                    }
                }

                if (columnIsEmpty) {
                    emptyColumns++;
                } else if (emptyColumns > 0) {
                    // This column needs to shift left
                    for (let r = 0; r < GRID_ROWS; r++) {
                        const block = grid[r][c];
                        if (block) {
                            const oldC = block.gridC;
                            const oldR = block.gridR;

                            // Update logical position in the grid array
                            grid[r][c - emptyColumns] = block;
                            grid[r][c] = null;

                            // Update block's internal logical position
                            block.gridC = c - emptyColumns;

                            // Set animation properties using BLOCK_W and BLOCK_H
                            block.currentX = oldC * BLOCK_W;
                            block.currentY = oldR * BLOCK_H;
                            block.targetX = block.gridC * BLOCK_W;
                            block.targetY = block.gridR * BLOCK_H;
                            block.state = 'moving';
                            block.alpha = 1; // Ensure block is visible if sliding
                            block.animationStartTime = performance.now();
                        }
                    }
                }
            }
        }

        /**
         * Orchestrates the logical grid updates (gravity, refill, shift)
         * after blocks have completed their removal animation.
         */
        function performLogicalGridUpdates() {
            // Apply gravity first
            applyGravityLogical();

            // Fill new blocks if under the move limit
            if (moves <= MAX_MOVES) {
                fillNewBlocksLogical();
            }

            // Then shift columns
            shiftColumnsLogical();
        }

        /**
         * Checks if there are any valid moves left on the board.
         * A valid move exists if there are at least two adjacent blocks of the same color.
         * @returns {boolean} True if valid moves exist, false otherwise.
         */
        function checkForValidMoves() {
            for (let r = 0; r < GRID_ROWS; r++) {
                for (let c = 0; c < GRID_COLS; c++) {
                    const block = grid[r][c];
                    if (block && block.state !== 'removing') { // Only consider visible, non-removing blocks
                        const color = block.color;
                        // Check right
                        if (c + 1 < GRID_COLS) {
                            const neighbor = grid[r][c + 1];
                            if (neighbor && neighbor.state !== 'removing' && neighbor.color === color) return true;
                        }
                        // Check down
                        if (r + 1 < GRID_ROWS) {
                            const neighbor = grid[r + 1][c];
                            if (neighbor && neighbor.state !== 'removing' && neighbor.color === color) return true;
                        }
                    }
                }
            }
            return false;
        }

        /**
         * Checks if all tiles have been cleared from the board.
         * @returns {boolean} True if all tiles are cleared, false otherwise.
         */
        function areAllTilesCleared() {
            for (let r = 0; r < GRID_ROWS; r++) {
                for (let c = 0; c < GRID_COLS; c++) {
                    if (grid[r][c] !== null) {
                        return false;
                    }
                }
            }
            return true;
        }


        /**
         * Checks for game end conditions (all tiles cleared or no more valid moves).
         * Triggers game over or congratulations screen with delay.
         */
        function checkGameEndConditions() {
            const noMoreMoves = !checkForValidMoves();
            const allTilesCleared = areAllTilesCleared();

            if (allTilesCleared) {
                gameActive = false; // Disable interaction
                setTimeout(() => {
                    displayCongratulations();
                }, GAME_END_DELAY);
            } else if (noMoreMoves) { // Game now only ends if no more valid moves, regardless of moves count
                gameOver = true;
                gameActive = false; // Disable interaction
                setTimeout(() => {
                    displayGameOver();
                }, GAME_END_DELAY);
            }
        }

        /**
         * Displays the game over screen.
         */
        function displayGameOver() {
            gameOverScoreDisplay.textContent = `Your final score: ${score}`;
            gameOverOverlay.classList.add('visible');
            canvas.onclick = null; // Disable clicks on canvas
        }

        /**
         * Displays the congratulations screen.
         */
        function displayCongratulations() {
            congratulationsScoreDisplay.textContent = `Your score: ${score}`;
            congratulationsOverlay.classList.add('visible');
            canvas.onclick = null; // Disable clicks on canvas
        }

        // Initialize game on window load
        window.onload = () => {
            initGame();
        };
        // Listen for window resize to make the canvas responsive
        window.addEventListener('resize', resizeCanvas);
        
      // Create audio
        
 

