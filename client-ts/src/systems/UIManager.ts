import * as THREE from "three";
import { PlayerState, GameStats } from "@/types/game";

export class UIManager {
  private healthBar: HTMLElement | null = null;
  private healthValue: HTMLElement | null = null;
  private weaponName: HTMLElement | null = null;
  private currentAmmo: HTMLElement | null = null;
  private maxAmmo: HTMLElement | null = null;
  private waveNumber: HTMLElement | null = null;
  private killCount: HTMLElement | null = null;
  private scoreValue: HTMLElement | null = null;
  private crosshair: HTMLElement | null = null;

  // 雷达相关
  private radarCanvas: HTMLCanvasElement | null = null;
  private radarContext: CanvasRenderingContext2D | null = null;
  private readonly RADAR_SIZE = 120;
  private readonly RADAR_RANGE = 60; // 增加范围以确保能看到所有怪物

  public async initialize(): Promise<void> {
    console.log("🎮 UIManager initializing...");

    this.setupUIElements();
    this.initializeRadar();
    this.setupEventListeners();

    console.log("✅ UIManager initialized");
  }

  private setupUIElements(): void {
    // 获取UI元素引用
    this.healthBar = document.getElementById("healthBar");
    this.healthValue = document.getElementById("healthValue");
    this.weaponName = document.getElementById("currentWeapon");
    this.currentAmmo = document.getElementById("currentAmmo");
    this.maxAmmo = document.getElementById("maxAmmo");
    this.waveNumber = document.getElementById("waveNumber");
    this.killCount = document.getElementById("killCount");
    this.scoreValue = document.getElementById("scoreValue");
    this.crosshair = document.querySelector(".crosshair");

    // 如果UI元素不存在，创建它们
    this.createMissingUIElements();
  }

  private createMissingUIElements(): void {
    // 只检查必要的UI元素，雷达已在HTML中定义
    const gameUI = document.getElementById("gameUI");
    if (!gameUI) {
      console.warn("Game UI container not found");
      return;
    }

    // 检查雷达是否存在
    const radarContainer = document.querySelector(".radar-container");
    if (!radarContainer) {
      console.warn(
        "Radar container not found in HTML, please check index.html"
      );
    }
  }

  private initializeRadar(): void {
    console.log("🔍 Looking for radar canvas...");
    this.radarCanvas = document.getElementById(
      "radarCanvas"
    ) as HTMLCanvasElement;
    if (this.radarCanvas) {
      console.log("✅ Radar canvas found:", this.radarCanvas);
      try {
        this.radarContext = this.radarCanvas.getContext("2d");
        if (this.radarContext) {
          console.log("📡 Mini radar initialized successfully");
        } else {
          console.warn("Failed to get 2D context for radar canvas");
        }
      } catch (error) {
        console.error("Error initializing radar context:", error);
      }
    } else {
      console.warn("❌ Radar canvas element not found - checking DOM...");
      // Debug: list all canvas elements
      const allCanvases = document.querySelectorAll("canvas");
      console.log("Found canvases:", allCanvases);
    }
  }

  private setupEventListeners(): void {
    // 监听窗口大小变化
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  private onWindowResize(): void {
    // 重新调整UI元素位置
    this.updateUILayout();
  }

  private updateUILayout(): void {
    // 根据屏幕大小调整UI布局
    // 这里可以添加响应式设计逻辑
  }

  public updateHealth(playerState: PlayerState): void {
    const healthPercentage = (playerState.health / 100) * 100; // 假设最大血量为100

    if (this.healthBar) {
      this.healthBar.style.width = `${healthPercentage}%`;

      // 根据血量改变颜色
      if (healthPercentage <= 25) {
        this.healthBar.style.background = "#ff0000"; // 红色
      } else if (healthPercentage <= 50) {
        this.healthBar.style.background =
          "linear-gradient(90deg, #ff0000 0%, #ffff00 100%)"; // 红到黄
      } else {
        this.healthBar.style.background =
          "linear-gradient(90deg, #ff0000 0%, #ffff00 50%, #00ff00 100%)"; // 完整渐变
      }
    }

    if (this.healthValue) {
      this.healthValue.textContent = Math.round(playerState.health).toString();
    }
  }

  public updateWeaponInfo(weaponData: {
    name: string;
    currentAmmo: number;
    maxAmmo: number;
    emoji: string;
  }): void {
    if (this.weaponName) {
      this.weaponName.textContent = `${weaponData.emoji} ${weaponData.name}`;
    }

    if (this.currentAmmo) {
      this.currentAmmo.textContent = weaponData.currentAmmo.toString();

      // 根据弹药量改变颜色
      if (weaponData.currentAmmo <= 10) {
        this.currentAmmo.style.color = "#ff4444"; // 红色 - 弹药很少
      } else if (weaponData.currentAmmo <= 30) {
        this.currentAmmo.style.color = "#ffaa00"; // 橙色 - 弹药较少
      } else {
        this.currentAmmo.style.color = "#ffffff"; // 白色 - 弹药充足
      }
    }

    if (this.maxAmmo) {
      this.maxAmmo.textContent = weaponData.maxAmmo.toString();
    }
  }

  public updateGameStats(gameStats: GameStats): void {
    if (this.waveNumber) {
      this.waveNumber.textContent = gameStats.currentWave.toString();
    }

    if (this.killCount) {
      this.killCount.textContent = gameStats.demonKills.toString();
    }

    if (this.scoreValue) {
      this.scoreValue.textContent = gameStats.score.toString();
    }
  }

  public updateRadar(
    playerPosition: THREE.Vector3,
    demons: Array<{ position: THREE.Vector3 }>,
    camera: THREE.Camera
  ): void {
    if (!this.radarContext || !this.radarCanvas) {
      console.warn("🔴 Radar not available:", {
        context: !!this.radarContext,
        canvas: !!this.radarCanvas,
      });
      return;
    }

    // 清除画布
    this.radarContext.clearRect(0, 0, this.RADAR_SIZE, this.RADAR_SIZE);

    const centerX = this.RADAR_SIZE / 2;
    const centerY = this.RADAR_SIZE / 2;

    // 绘制雷达网格
    this.drawRadarGrid();

    // 绘制恶魔
    this.drawDemonsOnRadar(playerPosition, demons, centerX, centerY);

    // 绘制玩家（中心点）
    this.drawPlayerOnRadar(centerX, centerY, camera);

    // 绘制范围圆圈
    this.drawRadarRangeCircles();
  }

  private drawRadarGrid(): void {
    if (!this.radarContext) return;

    this.radarContext.strokeStyle = "rgba(0, 255, 0, 0.2)";
    this.radarContext.lineWidth = 1;

    // 绘制十字线
    this.radarContext.beginPath();
    this.radarContext.moveTo(this.RADAR_SIZE / 2, 0);
    this.radarContext.lineTo(this.RADAR_SIZE / 2, this.RADAR_SIZE);
    this.radarContext.moveTo(0, this.RADAR_SIZE / 2);
    this.radarContext.lineTo(this.RADAR_SIZE, this.RADAR_SIZE / 2);
    this.radarContext.stroke();
  }

  private drawRadarRangeCircles(): void {
    if (!this.radarContext) return;

    this.radarContext.strokeStyle = "rgba(0, 255, 0, 0.15)";
    this.radarContext.lineWidth = 1;

    const centerX = this.RADAR_SIZE / 2;
    const centerY = this.RADAR_SIZE / 2;

    // 绘制范围圆圈：25%, 50%, 75%
    for (let i = 1; i <= 3; i++) {
      const radius = (this.RADAR_SIZE / 2) * (i / 4);
      this.radarContext.beginPath();
      this.radarContext.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.radarContext.stroke();
    }
  }

  private drawPlayerOnRadar(
    centerX: number,
    centerY: number,
    camera: THREE.Camera
  ): void {
    if (!this.radarContext) return;

    // 绘制玩家位置（中心绿点）
    this.radarContext.fillStyle = "#00ff00";
    this.radarContext.beginPath();
    this.radarContext.arc(centerX, centerY, 4, 0, Math.PI * 2);
    this.radarContext.fill();

    // 添加外环
    this.radarContext.strokeStyle = "#44ff44";
    this.radarContext.lineWidth = 2;
    this.radarContext.beginPath();
    this.radarContext.arc(centerX, centerY, 6, 0, Math.PI * 2);
    this.radarContext.stroke();

    // 绘制玩家方向指示器
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    const angle = Math.atan2(direction.x, direction.z);
    const lineLength = 8;
    const endX = centerX + Math.sin(angle) * lineLength;
    const endY = centerY - Math.cos(angle) * lineLength; // 反转Y轴以匹配雷达坐标系

    this.radarContext.strokeStyle = "#00ff00";
    this.radarContext.lineWidth = 2;
    this.radarContext.beginPath();
    this.radarContext.moveTo(centerX, centerY);
    this.radarContext.lineTo(endX, endY);
    this.radarContext.stroke();
  }

  private drawDemonsOnRadar(
    playerPos: THREE.Vector3,
    demons: Array<{ position: THREE.Vector3 }>,
    centerX: number,
    centerY: number
  ): void {
    if (!this.radarContext) return;

    demons.forEach((demon, index) => {
      const distance = playerPos.distanceTo(demon.position);

      if (distance <= this.RADAR_RANGE) {
        // 计算在雷达上的相对位置
        const relativeX = demon.position.x - playerPos.x;
        const relativeZ = demon.position.z - playerPos.z;

        // 转换到雷达坐标（注意：Z轴方向相反）
        const radarX =
          centerX + (relativeX / this.RADAR_RANGE) * (this.RADAR_SIZE / 2);
        const radarY =
          centerY - (relativeZ / this.RADAR_RANGE) * (this.RADAR_SIZE / 2); // 反转Z轴

        // 确保在雷达范围内
        if (
          radarX >= 0 &&
          radarX <= this.RADAR_SIZE &&
          radarY >= 0 &&
          radarY <= this.RADAR_SIZE &&
          this.radarContext
        ) {
          this.radarContext.fillStyle = "#ff0000"; // 红色表示恶魔
          this.radarContext.beginPath();
          this.radarContext.arc(radarX, radarY, 4, 0, Math.PI * 2); // 更大更明显
          this.radarContext.fill();

          // 添加外环以便更好地识别
          this.radarContext.strokeStyle = "#ff6666";
          this.radarContext.lineWidth = 2;
          this.radarContext.beginPath();
          this.radarContext.arc(radarX, radarY, 6, 0, Math.PI * 2);
          this.radarContext.stroke();
        }
      }
    });
  }

  public updateCrosshair(isTargeting: boolean = false): void {
    if (this.crosshair) {
      if (isTargeting) {
        this.crosshair.style.color = "#ff0000";
        this.crosshair.style.transform = "translate(-50%, -50%) scale(1.2)";
      } else {
        this.crosshair.style.color = "#00ff00";
        this.crosshair.style.transform = "translate(-50%, -50%) scale(1.0)";
      }
    }
  }

  public showDamageEffect(): void {
    // 创建受伤效果
    const damageOverlay = document.createElement("div");
    damageOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, transparent 0%, rgba(255, 0, 0, 0.3) 100%);
      pointer-events: none;
      z-index: 9999;
      animation: damageFlash 0.5s ease-out;
    `;

    // 添加动画样式
    const style = document.createElement("style");
    style.textContent = `
      @keyframes damageFlash {
        0% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(damageOverlay);

    // 500ms后移除效果
    setTimeout(() => {
      if (document.body.contains(damageOverlay)) {
        document.body.removeChild(damageOverlay);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    }, 500);
  }

  public showMessage(message: string, duration: number = 3000): void {
    const messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      padding: 10px 20px;
      border-radius: 5px;
      font-family: 'Orbitron', monospace;
      font-size: 16px;
      font-weight: bold;
      z-index: 10000;
      border: 2px solid #00ff00;
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      if (document.body.contains(messageDiv)) {
        document.body.removeChild(messageDiv);
      }
    }, duration);
  }

  public update(_deltaTime: number): void {
    // 每帧更新UI动画效果
    this.updateAnimations();
  }

  private updateAnimations(): void {
    // 可以在这里添加UI动画逻辑，比如准星动画、血量条动画等
  }

  // Multiplayer UI Management Methods

  // Connection status management
  public updateConnectionStatus(status: string): void {
    const connectionStatus = document.getElementById("connectionStatus");
    if (connectionStatus) {
      connectionStatus.textContent = status;

      // Update styling based on status
      if (status.includes("🟢")) {
        connectionStatus.style.borderColor = "#00ff00";
        connectionStatus.style.color = "#00ff00";
      } else if (status.includes("🔴")) {
        connectionStatus.style.borderColor = "#ff0000";
        connectionStatus.style.color = "#ff0000";
      } else if (status.includes("🔄")) {
        connectionStatus.style.borderColor = "#ffaa00";
        connectionStatus.style.color = "#ffaa00";
      }
    }
  }

  // Room list management
  public updateRoomsList(rooms: any[]): void {
    const roomList = document.getElementById("roomList");
    if (!roomList) return;

    if (rooms.length === 0) {
      roomList.innerHTML =
        '<div class="room-item empty">🏜️ No chambers found in Hell</div>';
      return;
    }

    roomList.innerHTML = rooms
      .map(
        (room) => `
      <div class="room-item" onclick="window.networkManager?.joinRoom('${
        room.id
      }')">
        <div class="room-info">
          <div class="room-name">🏰 ${room.name}</div>
          <div class="room-details">
            👹 ${room.players}/${room.maxPlayers} | 🗺️ ${room.mapType}
          </div>
        </div>
        <div class="room-status">
          ${room.players < room.maxPlayers ? "🟢 OPEN" : "🔴 FULL"}
        </div>
      </div>
    `
      )
      .join("");
  }

  // Party members management
  public updatePartyMembers(members: any[]): void {
    const partyMembers = document.getElementById("partyMembers");
    if (!partyMembers) return;

    partyMembers.innerHTML = members
      .map(
        (member) => `
      <div class="party-member ${member.isLeader ? "leader" : ""} ${
          member.ready ? "ready" : ""
        }">
        <div class="member-info">
          <div class="member-name">
            ${member.isLeader ? "👑" : "👹"} ${member.name}
          </div>
          <div class="member-status">
            ${member.isLeader ? "Chamber Leader" : "Demon"}
            ${member.ready ? " • Ready" : " • Not Ready"}
          </div>
        </div>
        <div class="member-ready-status">
          ${member.ready ? "✅" : "⏳"}
        </div>
      </div>
    `
      )
      .join("");
  }

  // Chat system management
  public addChatMessage(
    type: "system" | "player" | "voice",
    message: string,
    sender?: string
  ): void {
    const chatMessages = document.getElementById("chatMessages");
    if (!chatMessages) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${type}`;

    const timestamp = new Date().toLocaleTimeString();

    if (type === "system") {
      messageDiv.innerHTML = `<span style="color: #ffaa66; font-style: italic;">[${timestamp}] ${message}</span>`;
    } else if (type === "voice") {
      messageDiv.innerHTML = `<span style="color: #00ff00;">[${timestamp}] <span class="sender">${sender}:</span> ${message}</span>`;
    } else {
      messageDiv.innerHTML = `<span style="color: #ffffff;">[${timestamp}] <span class="sender">${sender}:</span> ${message}</span>`;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Limit chat history to prevent memory issues
    while (chatMessages.children.length > 100) {
      chatMessages.removeChild(chatMessages.firstChild!);
    }
  }

  public addGameChatMessage(
    type: "system" | "player" | "voice",
    message: string,
    sender?: string
  ): void {
    // For in-game chat, we could show it in a different location or overlay
    // For now, use the same chat system but with different styling
    this.addChatMessage(type, message, sender);

    // Also show as temporary overlay in game
    if (type === "voice" || type === "player") {
      this.showMessage(`${sender}: ${message}`, 3000);
    }
  }

  // Menu navigation
  public showMainMenu(): void {
    this.hideAllMenus();
    const mainMenu = document.getElementById("mainMenu");
    if (mainMenu) {
      mainMenu.style.display = "block";
    }
  }

  public showMultiplayerLobby(): void {
    this.hideAllMenus();
    const multiplayerLobby = document.getElementById("multiplayerLobby");
    if (multiplayerLobby) {
      multiplayerLobby.style.display = "block";
    }
  }

  public showPartyRoom(): void {
    this.hideAllMenus();
    const partyRoom = document.getElementById("partyRoom");
    if (partyRoom) {
      partyRoom.style.display = "block";
    }
  }

  public showInstructions(): void {
    this.hideAllMenus();
    const instructions = document.getElementById("instructionsScreen");
    if (instructions) {
      instructions.style.display = "block";
    }
  }

  public showGameOver(): void {
    this.hideAllMenus();
    const gameOver = document.getElementById("gameOverScreen");
    if (gameOver) {
      gameOver.style.display = "block";
    }
  }

  private hideAllMenus(): void {
    const menus = [
      "mainMenu",
      "multiplayerLobby",
      "partyRoom",
      "instructionsScreen",
      "gameOverScreen",
    ];

    menus.forEach((menuId) => {
      const menu = document.getElementById(menuId);
      if (menu) {
        menu.style.display = "none";
      }
    });
  }

  // Room management UI helpers
  public updateRoomTitle(roomName: string): void {
    const roomTitle = document.getElementById("roomTitle");
    if (roomTitle) {
      roomTitle.textContent = `🔥 ${roomName} 🔥`;
    }
  }

  public updateReadyButton(isReady: boolean): void {
    const readyButton = document.getElementById("readyButton");
    if (readyButton) {
      if (isReady) {
        readyButton.textContent = "✅ READY";
        readyButton.classList.add("ready");
      } else {
        readyButton.textContent = "⏳ NOT READY";
        readyButton.classList.remove("ready");
      }
    }
  }

  public updateStartGameButton(canStart: boolean, isLeader: boolean): void {
    const startButton = document.getElementById(
      "startGameButton"
    ) as HTMLButtonElement;
    if (startButton) {
      startButton.disabled = !canStart || !isLeader;
      if (!isLeader) {
        startButton.textContent = "🎮 WAITING FOR LEADER";
      } else if (!canStart) {
        startButton.textContent = "🎮 WAITING FOR PLAYERS";
      } else {
        startButton.textContent = "🎮 BEGIN HELLISH COMBAT";
      }
    }
  }

  // Voice chat UI
  public showVoiceIndicator(playerId: string): void {
    // Create or update voice activity indicator
    let indicator = document.getElementById(`voice-${playerId}`);
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = `voice-${playerId}`;
      indicator.className = "voice-indicator";
      indicator.textContent = "🎤";
      document.body.appendChild(indicator);
    }

    // Show indicator briefly
    indicator.style.display = "block";
    setTimeout(() => {
      if (indicator) {
        indicator.style.display = "none";
      }
    }, 1000);
  }

  // Room info display during game
  public showRoomInfo(roomName: string): void {
    let roomInfo = document.getElementById("roomInfo");
    if (!roomInfo) {
      roomInfo = document.createElement("div");
      roomInfo.id = "roomInfo";
      roomInfo.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: #ff6600;
        padding: 0.5rem 1rem;
        border: 2px solid #ff6600;
        border-radius: 5px;
        font-weight: 600;
        text-shadow: 0 0 10px #ff6600;
        z-index: 1000;
        font-family: 'Orbitron', monospace;
      `;
      document.body.appendChild(roomInfo);
    }
    roomInfo.textContent = `🏰 Chamber: ${roomName}`;
  }

  public hideRoomInfo(): void {
    const roomInfo = document.getElementById("roomInfo");
    if (roomInfo) {
      roomInfo.remove();
    }
  }

  // Server configuration UI helpers
  public getSelectedServerConfig(): { type: string; url: string } {
    const localServer = document.getElementById(
      "localServer"
    ) as HTMLInputElement;
    const lanServer = document.getElementById("lanServer") as HTMLInputElement;
    const customServer = document.getElementById(
      "customServer"
    ) as HTMLInputElement;
    const lanServerIP = document.getElementById(
      "lanServerIP"
    ) as HTMLInputElement;
    const customServerIP = document.getElementById(
      "customServerIP"
    ) as HTMLInputElement;

    if (localServer?.checked) {
      return { type: "local", url: "http://localhost:3000" };
    } else if (lanServer?.checked) {
      const ip = lanServerIP?.value || "192.168.1.100:3000";
      return { type: "lan", url: `http://${ip}` };
    } else if (customServer?.checked) {
      const ip = customServerIP?.value || "localhost:3000";
      return { type: "custom", url: `http://${ip}` };
    }

    return { type: "local", url: "http://localhost:3000" };
  }

  // Utility method to setup multiplayer event listeners
  public setupMultiplayerEventListeners(networkManager: any): void {
    // Server configuration radio buttons
    const serverRadios = document.querySelectorAll('input[name="serverType"]');
    serverRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        const lanInput = document.getElementById(
          "lanServerIP"
        ) as HTMLInputElement;
        const customInput = document.getElementById(
          "customServerIP"
        ) as HTMLInputElement;

        if (lanInput)
          lanInput.disabled = !(
            document.getElementById("lanServer") as HTMLInputElement
          )?.checked;
        if (customInput)
          customInput.disabled = !(
            document.getElementById("customServer") as HTMLInputElement
          )?.checked;
      });
    });

    // Connect to server button
    const connectBtn = document.getElementById("connectServerBtn");
    connectBtn?.addEventListener("click", () => {
      const config = this.getSelectedServerConfig();
      networkManager.setServerURL(config.url);
      networkManager.connectToServer();
    });

    // Create room button
    const createRoomBtn = document.getElementById("createRoomBtn");
    createRoomBtn?.addEventListener("click", () => {
      const roomName =
        (document.getElementById("roomName") as HTMLInputElement)?.value ||
        "Hell Chamber";
      const maxPlayers = parseInt(
        (document.getElementById("maxPlayers") as HTMLSelectElement)?.value ||
          "4"
      );
      const mapType =
        (document.getElementById("mapType") as HTMLSelectElement)?.value ||
        "industrial";

      networkManager.createRoom(roomName, maxPlayers, mapType);
    });

    // Refresh rooms button
    const refreshBtn = document.getElementById("refreshRoomsBtn");
    refreshBtn?.addEventListener("click", () => {
      networkManager.refreshRooms();
    });

    // Chat input
    const chatInput = document.getElementById("chatInput") as HTMLInputElement;
    const sendChatBtn = document.getElementById("sendChatBtn");

    const sendMessage = () => {
      const message = chatInput?.value.trim();
      if (message) {
        networkManager.sendChatMessage(message);
        chatInput.value = "";
      }
    };

    sendChatBtn?.addEventListener("click", sendMessage);
    chatInput?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    });

    // Ready button
    const readyBtn = document.getElementById("readyButton");
    readyBtn?.addEventListener("click", () => {
      networkManager.toggleReady();
    });

    // Start game button
    const startBtn = document.getElementById("startGameButton");
    startBtn?.addEventListener("click", () => {
      networkManager.startGame();
    });

    // Leave room button
    const leaveBtn = document.getElementById("leaveRoomBtn");
    leaveBtn?.addEventListener("click", () => {
      networkManager.leaveRoom();
      this.showMultiplayerLobby();
    });

    // Back to menu buttons
    const backBtns = document.querySelectorAll(
      "#backToMenuBtn, #backToMainMenuBtn"
    );
    backBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.showMainMenu();
      });
    });
  }
}
