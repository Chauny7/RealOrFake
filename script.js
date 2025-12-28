// 游戏数据 - 根据你的10张图片调整
const gameData = {
    rounds: [
        {
            images: ['images/fake1.png', 'images/fake2.png'],
            fakeIndex: 0, // 0 = Image A is fake, 1 = Image B is fake
            analysis: {
                title: "Contradictions in Light and Physical Logic",
                text: "Where does the light on the figure's shoulder come from—and why does the nearby white car show no corresponding reflection? This reveals a contradiction between multiple implied light sources.A three-legged dog with an impossible gait? Cars moving in opposite directions within the same lane? — physical logic collapses."
            }
        },
        {
            images: ['images/fake3.png', 'images/fake4.png'],
            fakeIndex: 1,
            analysis: {
                title: "Materiality and Functional Displacement",
                text: "An excess of correctness: blurred overlaps, unnaturally smooth paper textures.Everything feels recognisable, even comforting—yet too perfect. This is not a trace of lived experience, but a self-contained model optimised for visual consumption."

            }
        },
        {
            images: ['images/fake5.png', 'images/fake6.png'],
            fakeIndex: 0,
            analysis: {
                title: "The Erasure of Life and Temporality",
                text: "Disconnected hands and food, homogenised feathers, inconsistent depth and shadows.The image imitates the language of humanist photography, yet its subject is a form of life that never existed."
            }
        },
        {
            images: ['images/fake7.png', 'images/fake8.png'],
            fakeIndex: 1,
            analysis: {
                title: "Spatial and Epistemic Emptiness",
                text: "Looking at the strange shape of the last lamp, the homogenization and blurriness of the book details, and the stiffness of the transition between light and shadow, this image recreates the cultural image of the 'place of Knowledge', but what is worshipped in the palace is an empty shell of information."
            }
        },
        {
            images: ['images/fake9.png', 'images/fake10.png'],
            fakeIndex: 0,
            analysis: {
                title: "Cracks in Everyday Plausibility",
                text: "Unnatural avocado slices, empty newspapers, implausible bread textures.The image perfectly performs the ideology of a “healthy modern lifestyle,” while remaining detached from lived reality."
            }
        }
    ]
};

// 游戏状态
let currentRound = 0;
let userChoices = []; // 存储用户的选择 [{round: 0, choice: 'A', correct: true}, ...]
let gameCompleted = false;

// DOM 元素
const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');

// 游戏元素
const currentRoundEl = document.getElementById('current-round');
const roundNumberEl = document.getElementById('round-number');
const testIntro = document.getElementById('test-intro');
const comparisonView = document.getElementById('comparison-view');
const finalConfirmation = document.getElementById('final-confirmation');
const revealSection = document.getElementById('reveal');
const analysisSection = document.getElementById('analysis');
const wrongTitle = document.getElementById('wrong-title');

// 按钮
const imageSlots = document.querySelectorAll('.image-slot');
const finalConfirmBtn = document.getElementById('final-confirm-btn');
const finalReviewBtn = document.getElementById('final-review-btn');
const showDeceptionBtn = document.getElementById('show-deception-btn');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting initialization...');
    
    // 加载页面过渡
    setTimeout(function () {
      loadingScreen.style.opacity = '0';
      setTimeout(function () {
        loadingScreen.style.display = 'none';
        mainContent.classList.remove('hidden');
        // 👇 新增：触发动画
        const heroLines = document.querySelectorAll('#hero .type-line');
        if (heroLines.length > 0) {
          heroLines.forEach(line => line.classList.add('animate'));
        }
        // 播放快门音效
        const shutterSound = document.getElementById('shutter-sound');
        if (shutterSound) {
          shutterSound.currentTime = 0; // 重置到开头，防止重复播放时没声音
          shutterSound.play().catch(e => {
            console.log("音效播放失败，可能是浏览器自动静音策略");
          });
        }
        initApp();
        initScrollEffects();
        initTypewriter();
        startTestRound();
      }, 800);
    }, 3000);
});
// 游戏开始界面逻辑
// 游戏开始界面逻辑
function initGameIntro() {
    const gameIntro = document.getElementById('game-intro');
    const gameSection = document.getElementById('game');
    const bg3 = document.querySelector('.bg3');
    const secondLine = document.querySelector('.second-line');
    const typingSound = document.getElementById('typing-sound');
    const startButton = document.querySelector('.start-button-container');
    // 获取激光音效元素
    const laserSound = document.getElementById('laser-sound');
    
    // 隐藏游戏部分，先显示开始界面
    gameSection.classList.add('hidden');
    
    // 背景图过渡效果 - bg3透明度从0到70%
    setTimeout(() => {
        bg3.style.opacity = '0.7';
        
        // 背景过渡完成后，显示第二行文字的打字效果
        setTimeout(() => {
            typeWriterEffect(secondLine, "Can you really tell?", typingSound);
        }, 500); // 0.5秒延迟
    }, 500); // 稍微延迟开始背景过渡
    
    // 开始按钮点击事件
    startButton.addEventListener('click', () => {
        // 播放激光音效
        laserSound.play().catch(e => {
            console.log("激光音效播放失败:", e);
        });
        
        // 隐藏开始界面，显示游戏部分
        gameIntro.classList.add('hidden');
        gameSection.classList.remove('hidden');
        
        // 开始第一轮游戏
        startTestRound();
    });
}

// 打字机效果函数
function typeWriterEffect(element, text, sound) {
    let i = 0;
    element.style.opacity = '1';
    
    // 播放打字音效
    sound.play().catch(e => {
        console.log("打字音效播放失败:", e);
    });
    
    const typing = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typing);
            // 停止音效
            sound.pause();
            sound.currentTime = 0;
        }
    }, 100); // 每个字母间隔100ms
}
function initApp() {
    console.log('Initializing app...');
    
    // 重置游戏状态
    resetGame();
    // 初始化全局导航
    initGlobalNav();
    // 图片点击事件
    if (imageSlots.length > 0) {
        imageSlots.forEach(function(slot) {
            slot.addEventListener('click', function() {
                const selectedSlot = this.dataset.slot;
                console.log('Selected slot:', selectedSlot);
                selectImage(selectedSlot);
            });
        });
    }
    
    // 最终确认按钮
    if (finalConfirmBtn) {
        finalConfirmBtn.addEventListener('click', showReveal);
    }
    
    if (finalReviewBtn) {
        finalReviewBtn.addEventListener('click', function() {
            // 返回游戏，让用户重新选择
            finalConfirmation.classList.add('hidden');
            resetGame();
            startTestRound();
        });
    }
    
    if (showDeceptionBtn) {
        showDeceptionBtn.addEventListener('click', showAnalysis);
    }
    
    console.log('App initialization complete');
    // 在现有初始化函数中添加游戏开始界面初始化
// 找到现有的initApp函数，在其末尾添加：
initGameIntro();
// 获取点击音效元素
    const clickSound = document.getElementById('click-sound');
    
    // 为"I'M SURE,REVEAL THE RESULT"按钮添加音效
    if (finalConfirmBtn) {
        finalConfirmBtn.addEventListener('click', function() {
            // 播放点击音效
            clickSound.currentTime = 0;
            clickSound.play().catch(e => console.log("点击音效播放失败:", e));
        });
    }
    
    // 为"I'M HESITATING, DO IT AGAIN"按钮添加音效
    if (finalReviewBtn) {
        finalReviewBtn.addEventListener('click', function() {
            // 播放点击音效
            clickSound.currentTime = 0;
            clickSound.play().catch(e => console.log("点击音效播放失败:", e));
        });
    }
    
    // 为"SEE HOW YOU WERE DECEIVED"按钮添加音效
    if (showDeceptionBtn) {
        showDeceptionBtn.addEventListener('click', function() {
            // 播放点击音效
            clickSound.currentTime = 0;
            clickSound.play().catch(e => console.log("点击音效播放失败:", e));
        });
    }
}


function resetGame() {
    currentRound = 0;
    userChoices = [];
    gameCompleted = false;
    updateRoundDisplay();
}

function updateRoundDisplay() {
    if (currentRoundEl) {
        currentRoundEl.textContent = (currentRound + 1).toString().padStart(2, '0');
    }
    if (roundNumberEl) {
        roundNumberEl.textContent = (currentRound + 1).toString().padStart(2, '0');
    }
}

function startTestRound() {
    console.log('Starting test round:', currentRound + 1);
    
    // 更新图片
    const roundData = gameData.rounds[currentRound];
    console.log('Round data:', roundData);
    
    const images = document.querySelectorAll('.test-image');
    if (images.length >= 2) {
        // 添加错误处理
        images[0].onerror = function() {
            console.error('Failed to load image:', roundData.images[0]);
            this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="100%" height="100%" fill="%23f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="monospace" fill="%23999">Image not found</text></svg>';
        };
        images[1].onerror = function() {
            console.error('Failed to load image:', roundData.images[1]);
            this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="100%" height="100%" fill="%23f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="monospace" fill="%23999">Image not found</text></svg>';
        };
        
        images[0].src = roundData.images[0];
        images[1].src = roundData.images[1];
        console.log('Images updated:', roundData.images);
    }
    
    // 重置选择状态
    imageSlots.forEach(function(slot) {
        slot.style.border = 'none';
        slot.style.opacity = '1';
        slot.style.pointerEvents = 'auto';
    });
}
function selectImage(slot) {
    console.log('Image selected:', slot);
    
    // 播放激光音效
    const laserSound = document.getElementById('laser-sound');
    if (laserSound) {
        // 重置音效播放位置并播放（避免重复点击时音效不触发）
        laserSound.currentTime = 0;
        laserSound.play().catch(e => {
            console.log("激光音效播放失败:", e);
        });
    }
    
    // 保存用户选择
    const roundData = gameData.rounds[currentRound];
    const isCorrect = (slot === 'A' && roundData.fakeIndex === 0) || 
                     (slot === 'B' && roundData.fakeIndex === 1);
    
    console.log('Selection correct?', isCorrect);
    
    userChoices.push({
        round: currentRound,
        choice: slot,
        correct: isCorrect
    });
    
    // 高亮选择
    imageSlots.forEach(function(s) {
        if (s.dataset.slot === slot) {
            s.style.border = '2px solid var(--black)';
        } else {
            s.style.opacity = '0.6';
        }
        s.style.pointerEvents = 'none';
    });
    
    console.log('User choices so far:', userChoices);
    
    // 1秒后进入下一轮
    setTimeout(function() {
        nextRound();
    }, 1000);
}

function nextRound() {
    console.log('Moving to next round...');
    currentRound++;
    
    updateRoundDisplay();
    
    if (currentRound < gameData.rounds.length) {
        // 下一轮
        console.log('Next round:', currentRound + 1);
        startTestRound();
    } else {
        // 游戏结束，显示最终确认
        console.log('Game complete, showing final confirmation');
        gameCompleted = true;
        
        // 显示最终确认界面
        showFinalConfirmation();
    }
}

function showFinalConfirmation() {
    console.log('Showing final confirmation');
    
    // 显示最终确认
    if (finalConfirmation) {
        finalConfirmation.classList.remove('hidden');
        
        // 滚动到确认界面
        setTimeout(function() {
            window.scrollTo({
                top: finalConfirmation.offsetTop,
                behavior: 'smooth'
            });
        }, 300);
    }
}

function showReveal() {
    console.log('Showing reveal with snow effect');
    
    // 隐藏最终确认
    if (finalConfirmation) finalConfirmation.classList.add('hidden');
    
    // 显示揭示部分
    if (revealSection) {
        revealSection.classList.remove('hidden');
        // 播放揭示页音乐并设置循环
        const revealMusic = document.getElementById('reveal-music');
        if (revealMusic) {
            revealMusic.loop = true; // 设置单曲循环
            revealMusic.play().catch(e => {
                console.log("揭示页音乐播放失败:", e);
            });
        }
        
        // 创建雪花效果
        createSnowflakes();
        
        // 显示消息动画
        setTimeout(function() {
            const messages = document.querySelectorAll('.reveal-message p');
            messages.forEach(function(msg, index) {
                setTimeout(function() {
                    msg.classList.add('visible');
                }, index * 500);
            });
        }, 1000);
        
        // 滚动到揭示部分
        setTimeout(function() {
            window.scrollTo({
                top: revealSection.offsetTop,
                behavior: 'smooth'
            });
        }, 500);
    }
}

function createSnowflakes() {
    const snowflakesContainer = document.querySelector('.snowflakes');
    if (!snowflakesContainer) return;
    
    // 清空现有的雪花
    snowflakesContainer.innerHTML = '';
    
    // 创建100个雪花
    for (let i = 0; i < 100; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        // 随机大小
        const size = Math.random() * 8 + 3;
        snowflake.style.width = size + 'px';
        snowflake.style.height = size + 'px';
        
        // 随机位置
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.top = Math.random() * 100 + '%';
        
        // 随机透明度
        snowflake.style.opacity = Math.random() * 0.7 + 0.3;
        
        // 随机动画
        const duration = Math.random() * 10 + 5;
        const delay = Math.random() * 5;
        snowflake.style.animation = `fall ${duration}s linear ${delay}s infinite`;
        
        snowflakesContainer.appendChild(snowflake);
    }
    
    // 添加CSS动画
    if (!document.querySelector('#snow-animation')) {
        const style = document.createElement('style');
        style.id = 'snow-animation';
        style.textContent = `
            @keyframes fall {
                0% {
                    transform: translateY(-100px) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function showAnalysis() {
    const revealMusic = document.getElementById('reveal-music');
    if (revealMusic) {
        revealMusic.pause();
        revealMusic.currentTime = 0; // 重置播放位置
    }
    console.log('Showing analysis section');
    
    if (revealSection) revealSection.classList.add('hidden');
    if (analysisSection) analysisSection.classList.remove('hidden');
    
    // 生成分析卡片
    const analysisGrid = document.querySelector('.analysis-grid');
    if (analysisGrid) {
        analysisGrid.innerHTML = '';
        
        gameData.rounds.forEach(function(round, index) {
            const card = document.createElement('div');
            card.className = 'analysis-card';
            card.setAttribute('data-scroll', '');
            
            card.innerHTML = `
                <h4>Round ${index + 1}: ${round.analysis.title}</h4>
                <img src="${round.images[round.fakeIndex]}" alt="Analysis ${index + 1}" class="analysis-image">
                <p>${round.analysis.text}</p>
            `;
            
            analysisGrid.appendChild(card);
        });
        
        // 触发滚动动画
        setTimeout(function() {
            const cards = document.querySelectorAll('.analysis-card');
            cards.forEach(function(card, index) {
                setTimeout(function() {
                    card.classList.add('visible');
                }, index * 100);
            });
        }, 300);
    }
    
    // 滚动到分析部分
    setTimeout(function() {
        if (analysisSection) {
            window.scrollTo({
                top: analysisSection.offsetTop,
                behavior: 'smooth'
            });
        }
    }, 500);
}

function initScrollEffects() {
  const albumRecord = document.querySelector('.album-record');
  const textLines = document.querySelectorAll('.desc-line');
  const noteElement = document.getElementById('album-note');

  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;

    // 1. 背景图渐显（修复点）
    const fadeImage = document.querySelector('.hero-bg');
    if (fadeImage) {
      const maxScroll = 500;
      const opacity = Math.min(0.2 + (scrollY / maxScroll) * 0.8, 1);
      const contrast = 0.8 + (scrollY / maxScroll) * 0.4;
      const brightness = 0.7 + (scrollY / maxScroll) * 0.5;
      fadeImage.style.opacity = opacity;
      fadeImage.style.filter = `contrast(${contrast}) brightness(${brightness})`;
    }

    // 2. 唱片旋转
    if (albumRecord) {
      const rotation = (scrollY * 0.07) % 360;
      albumRecord.style.transform = `rotate(${rotation}deg)`;
    }

    // 3. 文字淡入
    textLines.forEach(line => {
      const rect = line.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom >= 0) {
        line.classList.add('visible');
      }
    });

    // 4. 音符淡入
    if (noteElement && albumRecord) {
      const rect = albumRecord.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
      if (isVisible) {
        noteElement.style.opacity = '1';
        noteElement.style.transform = 'translateX(-50%) translateY(0)';
      } else {
        noteElement.style.opacity = '0';
        noteElement.style.transform = 'translateX(-50%) translateY(20px)';
      }
    }
  });
  // 👇 新增：背景音乐控制
const bgMusic = document.getElementById('bg-music');

if (bgMusic && albumRecord) {
  // 监听唱片区域，当它进入视口时开始播放音乐
  window.addEventListener('scroll', function () {
    const rect = albumRecord.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

    if (isVisible && !bgMusic.paused) {
      // 如果音乐已经播放，不重复播放
      return;
    }

    if (isVisible) {
      bgMusic.play().catch(e => {
        console.log("音乐播放失败，可能是浏览器自动静音策略");
      });
      // 添加类名，让提示文字淡入
      document.body.classList.add('bg-music-playing');
    } else {
      // 如果唱片区域离开视口，暂停音乐
      bgMusic.pause();
      document.body.classList.remove('bg-music-playing');
    }
  });

  // 点击唱片暂停/播放音乐
  albumRecord.addEventListener('click', function () {
    if (bgMusic.paused) {
      bgMusic.play();
      document.body.classList.add('bg-music-playing');
    } else {
      bgMusic.pause();
      document.body.classList.remove('bg-music-playing');
    }
  });
}
  
}
// 动画函数保持不变...
function animateGhostFigures() {
    const figures = document.querySelectorAll('.ghost-figure');
    
    figures.forEach(function(figure, index) {
        setTimeout(function() {
            figure.style.opacity = '0.15';
            setTimeout(function() {
                figure.style.opacity = '0.08';
            }, 1500);
        }, index * 1000);
    });
    
    setTimeout(animateGhostFigures, 4000);
}

function animateTextFragments() {
    const fragments = document.querySelectorAll('.text-fragment');
    
    fragments.forEach(function(frag) {
        frag.style.transform = `translateY(${Math.random() * 20 - 10}px)`;
        frag.style.opacity = 0.3 + Math.random() * 0.2;
    });
    
    setTimeout(animateTextFragments, 2000);
}
function initGlobalNav() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = ['hero', 'intro', 'game', 'exploration'];

  // 为每个导航链接添加点击事件
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1); // 去掉 # 号
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 80, // 减去导航栏高度，避免遮挡
          behavior: 'smooth'
        });

        // 更新激活状态
        updateActiveNavLink(targetId);
      }
    });
  });

  // 监听滚动，动态更新激活的链接
  window.addEventListener('scroll', function() {
    let current = '';
    sections.forEach(section => {
      const sectionElement = document.getElementById(section);
      const sectionTop = sectionElement.offsetTop - 100; // 考虑导航栏和一点余量
      const sectionHeight = sectionElement.offsetHeight;

      if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
        current = section;
      }
    });

    updateActiveNavLink(current);
  });
}

function updateActiveNavLink(activeId) {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${activeId}`) {
      link.classList.add('active');
    }
  });
}
// 启动动画
setTimeout(function() {
    animateGhostFigures();
    animateTextFragments();
}, 1000);
// 处理详细分析页面的显示和隐藏
function initDetailedAnalysis() {
    const noteImage = document.querySelector('.analysis-note .note-img');
    const detailedAnalysis = document.getElementById('detailed-analysis');
    const mainAnalysis = document.querySelector('.analysis-section > .section-container');
    const backButton = document.getElementById('back-to-analysis');
    const clickSound = document.getElementById('click-sound');
    
    // 为音符图片添加点击事件
    if (noteImage && detailedAnalysis && mainAnalysis) {
        noteImage.addEventListener('click', function() {
            // 播放点击音效
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play().catch(e => console.log("点击音效播放失败:", e));
            }
            
            // 隐藏主分析内容，显示详细分析
            mainAnalysis.classList.add('hidden');
            detailedAnalysis.classList.remove('hidden');
            
            // 填充详细分析内容
            populateDetailedAnalysis();
        });
    }
    
    // // 为返回按钮添加点击事件
    // if (backButton && detailedAnalysis && mainAnalysis) {
    //     backButton.addEventListener('click', function() {
    //         // 播放点击音效
    //         if (clickSound) {
    //             clickSound.currentTime = 0;
    //             clickSound.play().catch(e => console.log("点击音效播放失败:", e));
    //         }
            
    //         // 隐藏详细分析，显示主分析内容
    //         detailedAnalysis.classList.add('hidden');
    //         mainAnalysis.classList.remove('hidden');
    //     });
    // }
    
    // 确保 analysis 部分的所有点击都播放音效
    const analysisElements = document.querySelectorAll('.analysis-section button, .analysis-section a, .analysis-card');
    analysisElements.forEach(element => {
        element.addEventListener('click', function() {
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play().catch(e => console.log("点击音效播放失败:", e));
            }
        });
    });
}

// 填充详细分析内容
function populateDetailedAnalysis() {
    const analysisGrid = document.querySelector('#detailed-analysis .analysis-grid');
    if (!analysisGrid) return;
    
    // 清空现有内容
    analysisGrid.innerHTML = '';
    
    // 假设这些是 fake2、fake3、fake6、fake7、fake10 的分析数据
    // 实际应用中，这些数据应该来自 gameData 或其他数据源
    const detailedAnalyses = [
        {
            id: 'fake2',
            title: 'Inconsistent Lighting Patterns',
            image: 'images/fake2.png',
            text: 'Strange reflections, anti-gravitational rain, unreadable signage, animals moving against spatial logic—Although visually convincing, these images violate gravity and causality. The rain does not fall; it floats. These elements are not traces of reality, but algorithmic rearrangements without any physical referent.'
        },
        {
            id: 'fake3',
            title: 'Materiality and Functional Displacement',
            image: 'images/fake3.png', 
            text: 'Cube-like steam, mercury-like book pages, glasses without lenses—material and function are displaced.Steam should diffuse and dissipate, yet here it becomes solid geometry, revealing AI’s limited understanding of material states.'
        },
        {
            id: 'fake6',
            title: 'The Erasure of Life and Temporality',
            image: 'images/fake6.png', 
            text: 'Mechanical pigeons, parchment-like leaves, missing shadows.The elderly figure feeding pigeons suggests narrative and duration, yet the pigeons’ “life” feels wound-up and artificial. Photography traditionally bears witness to time, but here time is frozen—no growth, no decay, only endless repetition.'
        },
        {
            id: 'fake7',
            title: 'Spatial and Epistemic Emptiness',
            image: 'images/fake7.png', 
            text: 'Non-Euclidean space, endlessly looping shelves.This environment could never exist physically; it is complete only as a model.All books are labelled “Lorem Ipsum,” a placeholder without meaning.The image reproduces the visual symbolism of knowledge, yet what it contains is informational emptiness.'
        },
        {
            id: 'fake10',
            title: 'Cracks in Everyday Plausibility',
            image: 'images/fake10.png', // 替换为实际图片路径
            text: 'Neon-blue spherical egg yolks, levitating toast, paradoxical headlines.Your brain recognises these impossibilities instinctively. AI does not—it only knows that such features can be statistically combined. This reveals an everyday world governed by probability rather than by physical, biological, or logical laws.'
        }
    ];
    
    // 创建分析卡片
    detailedAnalyses.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'analysis-card';
        card.setAttribute('data-scroll', '');
        
        card.innerHTML = `
            <h4>${item.title}</h4>
            <img src="${item.image}" alt="${item.id} analysis" class="analysis-image">
            <p>${item.text}</p>
        `;
        
        analysisGrid.appendChild(card);
        
        // 添加延迟显示动画
        setTimeout(() => {
            card.classList.add('visible');
        }, index * 100);
    });
}

// 在 initApp 函数中调用初始化函数
// 在现有的 initApp 函数末尾添加
initDetailedAnalysis();
// 修改详细分析页面的显示和隐藏逻辑，实现奇偶次点击切换
function initDetailedAnalysis() {
    const noteImage = document.querySelector('.analysis-note .note-img');
    const detailedAnalysis = document.getElementById('detailed-analysis');
    const mainAnalysis = document.querySelector('.analysis-section > .section-container');
    const backButton = document.getElementById('back-to-analysis');
    const clickSound = document.getElementById('click-sound');
    let clickCount = 0; // 点击计数器，用于判断奇偶次点击
    
    // 切换显示状态的函数
    function toggleAnalysisView(showDetailed) {
        if (showDetailed) {
            mainAnalysis.classList.add('hidden');
            detailedAnalysis.classList.remove('hidden');
            populateDetailedAnalysis();
        } else {
            // detailedAnalysis详细分析，显示主分析内容
            detailedAnalysis.classList.add('hidden');
            mainAnalysis.classList.remove('hidden');
        }
    }
    
    // 为音符图片添加点击事件
    if (noteImage && detailedAnalysis && mainAnalysis) {
        noteImage.addEventListener('click', function() {
            // 播放点击音效
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play().catch(e => console.log("点击音效效播放失败:", e));
            }
            
            // 切换点击次数并根据奇偶性切换视图
            clickCount++;
            // toggle奇数次点击显示详细分析，偶数次点击返回
            toggleAnalysisView(clickCount % 2 === 1);
        });
    }
    
    // 为返回按钮添加点击事件（保持原有功能）
    if (backButton && detailedAnalysis && mainAnalysis) {
        backButton.addEventListener('click', function() {
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play().catch(e => console.log("点击音效播放失败:", e));
            }
            
            // 点击返回按钮时重置计数器并显示主分析
            clickCount = 0;
            toggleAnalysisView(false);
        });
    }
    
    // 确保 analysis 部分的所有点击都播放音效
    const analysisElements = document.querySelectorAll('.analysis-section button, .analysis-section a, .analysis-card');
    analysisElements.forEach(element => {
        element.addEventListener('click', function() {
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play().catch(e => console.log("点击音效播放失败:", e));
            }
        });
    });
}


