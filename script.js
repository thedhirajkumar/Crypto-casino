const { useState, useEffect } = React;

const initialUser = {
  id: "",
  name: "",
  password: "",
  walletAddress: "",
  credits: 1000,
  deposit: 0,
  tier: "Bronze",
  referrals: [],
  weeklyPayout: 0,
  maxWeeklyPayout: 50000,
  lastPayoutReset: Date.now(),
  totalWins: 0,
  totalBets: 0,
};

const App = () => {
  const [users, setUsers] = useState(() => {
    try {
      const savedUsers = localStorage.getItem("users");
      return savedUsers ? JSON.parse(savedUsers) : [];
    } catch (e) {
      console.error("Error parsing users from localStorage:", e);
      return [];
    }
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [gameResult, setGameResult] = useState({
    slots: "", roulette: "", blackjack: "", dice: "", rps: "", spinWheel: "",
    poker: "", baccarat: "", craps: "", keno: "", sicBo: "", videoPoker: "",
  });
  const [isSpinning, setIsSpinning] = useState({
    slots: false, roulette: false, spinWheel: false, dice: false, craps: false, sicBo: false,
  });
  const [loginData, setLoginData] = useState({ id: "", password: "", walletAddress: "" });
  const [registerData, setRegisterData] = useState({ id: "", name: "", password: "", walletAddress: "" });
  const [bets, setBets] = useState({
    slots: 10, roulette: 15, blackjack: 20, dice: 10, rps: 10, spinWheel: 15,
    poker: 25, baccarat: 20, craps: 15, keno: 10, sicBo: 15, videoPoker: 20,
  });
  const [depositCrypto, setDepositCrypto] = useState("BTC");
  const [depositAmount, setDepositAmount] = useState(0);
  const [diceBetNumber, setDiceBetNumber] = useState(1);
  const [rpsChoice, setRpsChoice] = useState("Rock");
  const [baccaratChoice, setBaccaratChoice] = useState("Player");
  const [crapsBet, setCrapsBet] = useState("Pass");
  const [kenoNumbers, setKenoNumbers] = useState([1, 2, 3, 4]);
  const [sicBoBet, setSicBoBet] = useState("Big");
  const [showPlayGames, setShowPlayGames] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const handleRegister = () => {
    if (users.find((u) => u.id === registerData.id)) {
      alert("User ID already exists!");
      return;
    }
    if (!registerData.walletAddress) {
      alert("Wallet address is required!");
      return;
    }
    const newUser = { ...initialUser, ...registerData };
    setUsers([...users, newUser]);
    setRegisterData({ id: "", name: "", password: "", walletAddress: "" });
    alert("Registration successful! Please log in.");
  };

  const handleLogin = () => {
    const user = users.find(
      (u) =>
        u.id === loginData.id &&
        u.password === loginData.password &&
        u.walletAddress === loginData.walletAddress
    );
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
    } else {
      alert("Invalid ID, password, or wallet address!");
    }
  };

  const handleLogout = () => {
    updateUser(currentUser);
    setCurrentUser(null);
    setIsLoggedIn(false);
    setLoginData({ id: "", password: "", walletAddress: "" });
    setGameResult({
      slots: "", roulette: "", blackjack: "", dice: "", rps: "", spinWheel: "",
      poker: "", baccarat: "", craps: "", keno: "", sicBo: "", videoPoker: "",
    });
    setShowPlayGames(false);
    setShowReferrals(false);
  };

  const updateUser = (updatedUser) => {
    const updatedUsers = users.map((u) =>
      u.id === updatedUser.id ? updatedUser : u
    );
    setUsers(updatedUsers);
    setCurrentUser(updatedUser);
  };

  useEffect(() => {
    if (!currentUser) return;
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    if (now - currentUser.lastPayoutReset >= oneWeek) {
      const updatedUser = { ...currentUser, weeklyPayout: 0, lastPayoutReset: now };
      updateUser(updatedUser);
    }
  }, [currentUser]);

  const updateTier = (deposit) => {
    if (deposit >= 500) return "Gold";
    if (deposit >= 100) return "Silver";
    return "Bronze";
  };

  const handleCryptoDeposit = () => {
    if (depositAmount <= 0) {
      alert("Please enter a valid deposit amount!");
      return;
    }
    const exchangeRates = {
      BTC: 60000,
      ETH: 2000,
      USDT: 1,
    };
    const creditsToAdd = depositAmount * exchangeRates[depositCrypto];
    const newDeposit = currentUser.deposit + creditsToAdd;
    const newTier = updateTier(newDeposit);
    const updatedUser = {
      ...currentUser,
      deposit: newDeposit,
      tier: newTier,
      credits: currentUser.credits + creditsToAdd,
    };
    updateUser(updatedUser);
    setDepositAmount(0);
    alert(`Successfully deposited ${depositAmount} ${depositCrypto}! Added ${creditsToAdd} credits.`);
  };

  const playSlots = () => {
    const betAmount = bets.slots;
    if (currentUser.credits < betAmount) {
      alert("Not enough credits! Deposit more.");
      return;
    }
    setIsSpinning({ ...isSpinning, slots: true });
    setTimeout(() => {
      const symbols = ["🍒", "🍋", "🍊"];
      const result = Array(3).fill().map(() => symbols[Math.floor(Math.random() * symbols.length)]);
      setGameResult({ ...gameResult, slots: result.join(" | ") });
      const win = result.every((symbol) => symbol === result[0]);
      const newCredits = win ? currentUser.credits + betAmount * 5 : currentUser.credits - betAmount;
      const updatedUser = {
        ...currentUser,
        credits: newCredits,
        totalWins: win ? currentUser.totalWins + 1 : currentUser.totalWins,
        totalBets: currentUser.totalBets + 1,
      };
      updateUser(updatedUser);
      setIsSpinning({ ...isSpinning, slots: false });
    }, 1500);
  };

  const playRoulette = () => {
    const betAmount = bets.roulette;
    if (currentUser.credits < betAmount) {
      alert("Not enough credits! Deposit more.");
      return;
    }
    setIsSpinning({ ...isSpinning, roulette: true });
    setTimeout(() => {
      const number = Math.floor(Math.random() * 37);
      const color = number === 0 ? "Green" : number % 2 === 0 ? "Red" : "Black";
      setGameResult({ ...gameResult, roulette: `Number: ${number} (${color})` });
      const win = color === "Red";
      const newCredits = win ? currentUser.credits + betAmount * 2 : currentUser.credits - betAmount;
      const updatedUser = {
        ...currentUser,
        credits: newCredits,
        totalWins: win ? currentUser.totalWins + 1 : currentUser.totalWins,
        totalBets: currentUser.totalBets + 1,
      };
      updateUser(updatedUser);
      setIsSpinning({ ...isSpinning, roulette: false });
    }, 1500);
  };

  const playBlackjack = () => {
    const betAmount = bets.blackjack;
    if (currentUser.credits < betAmount) {
      alert("Not enough credits! Deposit more.");
      return;
    }
    const playerScore = Math.floor(Math.random() * 11) + 11;
    const dealerScore = Math.floor(Math.random() * 11) + 11;
    setGameResult({ ...gameResult, blackjack: `Player: ${playerScore} | Dealer: ${dealerScore}` });
    const win = playerScore <= 21 && (playerScore > dealerScore || dealerScore > 21);
    const newCredits = win ? currentUser.credits + betAmount * 2 : currentUser.credits - betAmount;
    const updatedUser = {
      ...currentUser,
      credits: newCredits,
      totalWins: win ? currentUser.totalWins + 1 : currentUser.totalWins,
      totalBets: currentUser.totalBets + 1,
    };
    updateUser(updatedUser);
  };

  const playDice = () => {
    const betAmount = bets.dice;
    if (currentUser.credits < betAmount) {
      alert("Not enough credits! Deposit more.");
      return;
    }
    setIsSpinning({ ...isSpinning, dice: true });
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setGameResult({ ...gameResult, dice: `Rolled: ${roll}` });
      const win = roll === diceBetNumber;
      const newCredits = win ? currentUser.credits + betAmount * 5 : currentUser.credits - betAmount;
      const updatedUser = {
        ...currentUser,
        credits: newCredits,
        totalWins: win ? currentUser.totalWins + 1 : currentUser.totalWins,
        totalBets: currentUser.totalBets + 1,
      };
      updateUser(updatedUser);
      setIsSpinning({ ...isSpinning, dice: false });
    }, 1500);
  };

  const playRps = () => {
    const betAmount = bets.rps;
    if (currentUser.credits < betAmount) {
      alert("Not enough credits! Deposit more.");
      return;
    }
    const choices = ["Rock", "Paper", "Scissors"];
    const computerChoice = choices[Math.floor(Math.random() * 3)];
    const win =
      (rpsChoice === "Rock" && computerChoice === "Scissors") ||
      (rpsChoice === "Paper" && computerChoice === "Rock") ||
      (rpsChoice === "Scissors" && computerChoice === "Paper");
    const draw = rpsChoice === computerChoice;
    setGameResult({ ...gameResult, rps: `You: ${rpsChoice} | Computer: ${computerChoice}` });
    const newCredits = draw
      ? currentUser.credits
      : win
      ? currentUser.credits + betAmount * 2
      : currentUser.credits - betAmount;
    const updatedUser = {
      ...currentUser,
      credits: newCredits,
      totalWins: win ? currentUser.totalWins + 1 : currentUser.totalWins,
      totalBets: currentUser.totalBets + 1,
    };
    updateUser(updatedUser);
  };

  const playSpinWheel = () => {
    const betAmount = bets.spinWheel;
    if (currentUser.credits < betAmount) {
      alert("Not enough credits! Deposit more.");
      return;
    }
    setIsSpinning({ ...isSpinning, spinWheel: true });
    setTimeout(() => {
      const segments = ["10 Credits", "50 Credits", "Lose", "100 Credits", "Lose", "Jackpot (500 Credits)"];
      const result = segments[Math.floor(Math.random() * segments.length)];
      setGameResult({ ...gameResult, spinWheel: `Result: ${result}` });
      let newCredits = currentUser.credits - betAmount;
      let win = false;
      if (result === "10 Credits") { newCredits += 10; win = true; }
      if (result === "50 Credits") { newCredits += 50; win = true; }
      if (result === "100 Credits") { newCredits += 100; win = true; }
      if (result === "Jackpot (500 Credits)") { newCredits += 500; win = true; }
      const updatedUser = {
        ...currentUser,
        credits: newCredits,
        totalWins: win ? currentUser.totalWins + 1 : currentUser.totalWins,
        totalBets: currentUser.totalBets + 1,
      };
      updateUser(updatedUser);
      setIsSpinning({ ...isSpinning, spinWheel: false });
    }, 1500);
  };

  const playPoker = () => {
    const betAmount = bets.poker;
    if (currentUser.credits < betAmount) {
      alert("Not enough credits! Deposit more.");
      return;
    }
    const hands = ["High Card", "Pair", "Two Pair", "Three of a Kind", "Straight", "Flush", "Full House"];
    const hand = hands[Math.floor(Math.random() * hands.length)];
    setGameResult({ ...gameResult, poker: `Hand: ${hand}` });
    const winMultiplier = hands.indexOf(hand) + 1;
    const newCredits = currentUser.credits - betAmount + (hand !== "High Card" ? betAmount * winMultiplier : 0);
    const updatedUser = {
      ...currentUser,
      credits: newCredits,
      totalWins: hand !== "High Card" ? currentUser.totalWins + 1 : currentUser.totalWins,
      totalBets: currentUser.totalBets + 1,
    };
    updateUser(updatedUser);
  };

  const playBaccarat = () => {
    const betAmount = bets.baccarat;
    if (currentUser.credits < betAmount) {
      alert("Not enough credits! Deposit more.");
      return;
    }
    const playerScore = Math.floor(Math.random() * 10);
    const bankerScore = Math.floor(Math.random() * 10);
    const winner = playerScore > bankerScore ? "Player" : bankerScore > playerScore ? "Banker" : "Tie";
    setGameResult({ ...gameResult, baccarat: `Player: ${playerScore} | Banker: ${bankerScore} | Winner: ${winner}` });
    const win = baccaratChoice === winner;
    const newCredits = win ? currentUser.credits + betAmount * 2 : currentUser.credits - betAmount;
    const updatedUser = {
      ...currentUser,
      credits: newCredits,
      totalWins: win ? currentUser.totalWins + 1 : currentUser.totalWins,
      totalBets: currentUser.totalBets + 1,
    };
    updateUser(updatedUser);
  };

  const playCraps = () => {
    const betAmount = bets.craps;
    if (currentUser.credits < betAmount) {
      alert("Not enough credits! Deposit more.");
      return;
    }
    setIsSpinning({ ...isSpinning, craps: true });
    setTimeout(() => {
      const die1 = Math.floor(Math.random() * 6) + 1;
      const die2 = Math.floor(Math.random() * 6) + 1;
      const sum = die1 + die2;
      const win = crapsBet === "Pass" ? (sum === 7 || sum === 11) : (sum === 2 || sum === 3 || sum === 12);
      setGameResult({ ...gameResult, craps: `Rolled: ${die1} + ${die2} = ${sum}` });
      const newCredits = win ? currentUser.credits + betAmount * 2 : currentUser.credits - betAmount;
      const updatedUser = {
        ...currentUser,
        credits: newCredits,
        totalWins: win ? currentUser.totalWins + 1 : currentUser.totalWins,
        totalBets: currentUser.totalBets + 1,
      };
      updateUser(updatedUser);
      setIsSpinning({ ...isSpinning, craps: false });
    }, 1500);
  };

  const playKeno = () => {
    const betAmount = bets.keno;
    if (currentUser.credits < betAmount) {
      alert("Not enough credits! Deposit more.");
      return;
    }
    const drawnNumbers = Array(10).fill().map(() => Math.floor(Math.random() * 80) + 1);
    const matches = kenoNumbers.filter(num => drawnNumbers.includes(num)).length;
    setGameResult({ ...gameResult, keno: `Drawn: ${drawnNumbers.join(", ")} | Matches: ${matches}` });
    const winMultiplier = matches * 2;
    const newCredits = currentUser.credits - betAmount + (matches > 0 ? betAmount * winMultiplier : 0);
    const updatedUser = {
      ...currentUser,
      credits: newCredits,
      totalWins: matches > 0 ? currentUser.totalWins + 1 : currentUser.totalWins,
      totalBets: currentUser.totalBets + 1,
    };
    updateUser(updatedUser);
  };

  const playSicBo = () => {
    const betAmount = bets.sicBo;
    if (currentUser.credits < betAmount) {
      alert("Not enough credits! Deposit more.");
      return;
    }
    setIsSpinning({ ...isSpinning, sicBo: true });
    setTimeout(() => {
      const dice = Array(3).fill().map(() => Math.floor(Math.random() * 6) + 1);
      const sum = dice.reduce((a, b) => a + b, 0);
      const isBig = sum >= 11 && sum <= 17;
      const isSmall = sum >= 4 && sum <= 10;
      const win = (sicBoBet === "Big" && isBig) || (sicBoBet === "Small" && isSmall);
      setGameResult({ ...gameResult, sicBo: `Dice: ${dice.join(", ")} | Sum: ${sum}` });
      const newCredits = win ? currentUser.credits + betAmount * 2 : currentUser.credits - betAmount;
      const updatedUser = {
        ...currentUser,
        credits: newCredits,
        totalWins: win ? currentUser.totalWins + 1 : currentUser.totalWins,
        totalBets: currentUser.totalBets + 1,
      };
      updateUser(updatedUser);
      setIsSpinning({ ...isSpinning, sicBo: false });
    }, 1500);
  };

  const playVideoPoker = () => {
    const betAmount = bets.videoPoker;
    if (currentUser.credits < betAmount) {
      alert("Not enough credits! Deposit more.");
      return;
    }
    const hands = ["Jacks or Better", "Two Pair", "Three of a Kind", "Straight", "Flush", "Full House"];
    const hand = hands[Math.floor(Math.random() * hands.length)];
    setGameResult({ ...gameResult, videoPoker: `Hand: ${hand}` });
    const winMultiplier = hands.indexOf(hand) + 1;
    const newCredits = currentUser.credits - betAmount + (hand !== "Jacks or Better" ? betAmount * winMultiplier : 0);
    const updatedUser = {
      ...currentUser,
      credits: newCredits,
      totalWins: hand !== "Jacks or Better" ? currentUser.totalWins + 1 : currentUser.totalWins,
      totalBets: currentUser.totalBets + 1,
    };
    updateUser(updatedUser);
  };

  const addReferral = () => {
    const newReferral = {
      id: `user${Math.random().toString(36).substr(2, 5)}`,
      left: null,
      right: null,
    };

    const updatedReferrals = [...currentUser.referrals];
    let placed = false;
    const queue = [...updatedReferrals];
    while (queue.length > 0 && !placed) {
      const node = queue.shift();
      if (!node.left) {
        node.left = newReferral;
        placed = true;
      } else if (!node.right) {
        node.right = newReferral;
        placed = true;
      } else {
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
      }
    }

    if (!placed) {
      updatedReferrals.push(newReferral);
    }

    const payout = currentUser.tier === "Gold" ? 50 : currentUser.tier === "Silver" ? 20 : 10;
    const newWeeklyPayout = Math.min(currentUser.weeklyPayout + payout, currentUser.maxWeeklyPayout);
    const updatedUser = { ...currentUser, referrals: updatedReferrals, weeklyPayout: newWeeklyPayout };
    updateUser(updatedUser);
  };

  const calculateReferralStats = () => {
    const totalReferrals = currentUser.referrals.length;
    let level1Count = 0;
    let level2Count = 0;
    let level3Count = 0;

    const queue = [...currentUser.referrals];
    let currentLevel = 1;
    let nodesAtCurrentLevel = queue.length;
    let nodesAtNextLevel = 0;

    while (queue.length > 0) {
      const node = queue.shift();
      nodesAtCurrentLevel--;

      if (currentLevel === 1) level1Count++;
      if (currentLevel === 2) level2Count++;
      if (currentLevel === 3) level3Count++;

      if (node.left) {
        queue.push(node.left);
        nodesAtNextLevel++;
      }
      if (node.right) {
        queue.push(node.right);
        nodesAtNextLevel++;
      }

      if (nodesAtCurrentLevel === 0) {
        currentLevel++;
        nodesAtCurrentLevel = nodesAtNextLevel;
        nodesAtNextLevel = 0;
      }
    }

    const payoutPerReferral = currentUser.tier === "Gold" ? 50 : currentUser.tier === "Silver" ? 20 : 10;
    const level1Earnings = level1Count * payoutPerReferral * 1;
    const level2Earnings = level2Count * payoutPerReferral * 0.5;
    const level3Earnings = level3Count * payoutPerReferral * 0.25;
    const totalEarnings = level1Earnings + level2Earnings + level3Earnings;

    return {
      totalReferrals,
      level1Count,
      level2Count,
      level3Count,
      level1Earnings,
      level2Earnings,
      level3Earnings,
      totalEarnings,
    };
  };

  const renderTree = (node) => {
    if (!node) return null;
    return (
      <div className="tree-node">
        <span>{node.id}</span>
        {(node.left || node.right) && (
          <div className="tree-children">
            {renderTree(node.left)}
            {renderTree(node.right)}
          </div>
        )}
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6">Crypto Casino MLM</h1>

        <div className="mb-6 p-4 bg-gray-800 rounded-lg w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Login</h2>
          <input
            type="text"
            placeholder="User ID"
            value={loginData.id}
            onChange={(e) => setLoginData({ ...loginData, id: e.target.value })}
            className="mb-2 p-2 w-full bg-gray-700 rounded text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            className="mb-2 p-2 w-full bg-gray-700 rounded text-white"
          />
          <input
            type="text"
            placeholder="Wallet Address"
            value={loginData.walletAddress}
            onChange={(e) => setLoginData({ ...loginData, walletAddress: e.target.value })}
            className="mb-2 p-2 w-full bg-gray-700 rounded text-white"
          />
          <button
            onClick={handleLogin}
            className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 w-full"
          >
            Login
          </button>
        </div>

        <div className="p-4 bg-gray-800 rounded-lg w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Register</h2>
          <input
            type="text"
            placeholder="User ID"
            value={registerData.id}
            onChange={(e) => setRegisterData({ ...registerData, id: e.target.value })}
            className="mb-2 p-2 w-full bg-gray-700 rounded text-white"
          />
          <input
            type="text"
            placeholder="Name"
            value={registerData.name}
            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
            className="mb-2 p-2 w-full bg-gray-700 rounded text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={registerData.password}
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
            className="mb-2 p-2 w-full bg-gray-700 rounded text-white"
          />
          <input
            type="text"
            placeholder="Wallet Address"
            value={registerData.walletAddress}
            onChange={(e) => setRegisterData({ ...registerData, walletAddress: e.target.value })}
            className="mb-2 p-2 w-full bg-gray-700 rounded text-white"
          />
          <button
            onClick={handleRegister}
            className="mt-2 px-4 py-2 bg-green-600 rounded hover:bg-green-700 w-full"
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  const referralStats = calculateReferralStats();
  const payoutPercentage = (currentUser.weeklyPayout / currentUser.maxWeeklyPayout) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <div className="avatar">{currentUser.name[0]}</div>
          Crypto Casino MLM - Welcome, <span className="welcome-name">{currentUser.name}</span>
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="dashboard-hero">
        <h2 className="text-2xl font-bold mb-2">Your Casino Dashboard</h2>
        <p className="text-gray-300">Play, Win, and Grow Your Network!</p>
      </div>

      <div className="dashboard-section">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="dashboard-card">
            <h3 className="text-xl font-semibold mb-2">
              <span className="dashboard-icon">💰</span> Wallet Summary
            </h3>
            <p className="mb-1">Credits: {currentUser.credits}</p>
            <p className="mb-1">Total Deposits: ${currentUser.deposit}</p>
            <p className="mb-1">Tier: {currentUser.tier}</p>
            <p className="mb-1">Weekly Payout: ${currentUser.weeklyPayout} / ${currentUser.maxWeeklyPayout}</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${payoutPercentage}%` }}
              ></div>
            </div>
            <p className="mt-1">Connected Address: {currentUser.walletAddress.slice(0, 6)}...{currentUser.walletAddress.slice(-4)}</p>
          </div>

          <div className="dashboard-card">
            <h3 className="text-xl font-semibold mb-2">
              <span className="dashboard-icon">🧭</span> Navigation
            </h3>
            <button
              onClick={() => {
                setShowPlayGames(!showPlayGames);
                setShowReferrals(false);
              }}
              className="w-full mb-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 nav-button"
            >
              {showPlayGames ? "Hide Play Games" : "Show Play Games"}
            </button>
            <button
              onClick={() => {
                setShowReferrals(!showReferrals);
                setShowPlayGames(false);
              }}
              className="w-full px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 nav-button"
            >
              {showReferrals ? "Hide Referrals" : "Show Referrals"}
            </button>
          </div>

          <div className="dashboard-card">
            <h3 className="text-xl font-semibold mb-2">
              <span className="dashboard-icon">📈</span> Deposit Crypto
            </h3>
            <div className="flex items-center mb-2">
              <label className="mr-2">Select Cryptocurrency:</label>
              <select
                value={depositCrypto}
                onChange={(e) => setDepositCrypto(e.target.value)}
                className="p-1 bg-gray-700 rounded text-white"
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">Tether (USDT)</option>
              </select>
            </div>
            <div className="flex items-center mb-2">
              <label className="mr-2">Amount to Deposit:</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="p-1 bg-gray-700 rounded text-white w-32"
                min="0"
                step="0.0001"
              />
            </div>
            <button
              onClick={handleCryptoDeposit}
              className="mt-2 px-4 py-2 bg-green-600 rounded hover:bg-green-700 w-full"
            >
              Deposit
            </button>
            <p className="mt-2 text-sm text-gray-400">
              Exchange Rates: 1 BTC = 60,000 credits, 1 ETH = 2,000 credits, 1 USDT = 1 credit
            </p>
          </div>
        </div>

        <div className="stats-widget">
          <div className="stats-card">
            <h4 className="text-lg font-semibold">Total Bets</h4>
            <p className="text-2xl">{currentUser.totalBets}</p>
          </div>
          <div className="stats-card">
            <h4 className="text-lg font-semibold">Total Wins</h4>
            <p className="text-2xl">{currentUser.totalWins}</p>
          </div>
          <div className="stats-card">
            <h4 className="text-lg font-semibold">Win Rate</h4>
            <p className="text-2xl">
              {currentUser.totalBets > 0
                ? ((currentUser.totalWins / currentUser.totalBets) * 100).toFixed(1)
                : 0}%
            </p>
          </div>
        </div>
      </div>

      {showPlayGames && (
        <div className="play-games-section">
          <h2 className="text-3xl font-bold mb-4 gradient-text text-center">Play Games</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="game-header-slots p-2 rounded-t-lg">
                <h2 className="text-xl font-semibold game-slots">Slots Game</h2>
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Bet Amount:</label>
                <input
                  type="number"
                  value={bets.slots}
                  onChange={(e) => setBets({ ...bets, slots: Number(e.target.value) })}
                  className="p-1 bg-gray-700 rounded text-white w-20"
                  min="1"
                />
              </div>
              <button
                onClick={playSlots}
                className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                disabled={isSpinning.slots}
              >
                {isSpinning.slots ? "Spinning..." : "Spin"}
              </button>
              {isSpinning.slots && (
                <p className="mt-2 text-lg spin-animation">🍒 | 🍋 | 🍊</p>
              )}
              {gameResult.slots && !isSpinning.slots && (
                <p className="mt-2 text-lg">{gameResult.slots}</p>
              )}
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="game-header-roulette p-2 rounded-t-lg">
                <h2 className="text-xl font-semibold game-roulette">Roulette Game</h2>
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Bet Amount (Bet on Red):</label>
                <input
                  type="number"
                  value={bets.roulette}
                  onChange={(e) => setBets({ ...bets, roulette: Number(e.target.value) })}
                  className="p-1 bg-gray-700 rounded text-white w-20"
                  min="1"
                />
              </div>
              <button
                onClick={playRoulette}
                className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                disabled={isSpinning.roulette}
              >
                {isSpinning.roulette ? "Spinning..." : "Spin"}
              </button>
              {isSpinning.roulette && (
                <p className="mt-2 text-lg spin-animation">Wheel Spinning...</p>
              )}
              {gameResult.roulette && !isSpinning.roulette && (
                <p className="mt-2 text-lg">{gameResult.roulette}</p>
              )}
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="game-header-blackjack p-2 rounded-t-lg">
                <h2 className="text-xl font-semibold game-blackjack">Blackjack Game</h2>
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Bet Amount:</label>
                <input
                  type="number"
                  value={bets.blackjack}
                  onChange={(e) => setBets({ ...bets, blackjack: Number(e.target.value) })}
                  className="p-1 bg-gray-700 rounded text-white w-20"
                  min="1"
                />
              </div>
              <button
                onClick={playBlackjack}
                className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Play
              </button>
              {gameResult.blackjack && (
                <p className="mt-2 text-lg">Result: {gameResult.blackjack}</p>
              )}
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="game-header-dice p-2 rounded-t-lg">
                <h2 className="text-xl font-semibold game-dice">Dice Game</h2>
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Bet Amount:</label>
                <input
                  type="number"
                  value={bets.dice}
                  onChange={(e) => setBets({ ...bets, dice: Number(e.target.value) })}
                  className="p-1 bg-gray-700 rounded text-white w-20"
                  min="1"
                />
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Bet on Number (1-6):</label>
                <input
                  type="number"
                  value={diceBetNumber}
                  onChange={(e) => setDiceBetNumber(Number(e.target.value))}
                  className="p-1 bg-gray-700 rounded text-white w-20"
                  min="1"
                  max="6"
                />
              </div>
              <button
                onClick={playDice}
                className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                disabled={isSpinning.dice}
              >
                {isSpinning.dice ? "Rolling..." : "Roll"}
              </button>
              {isSpinning.dice && (
                <p className="mt-2 text-lg roll-animation">🎲</p>
              )}
              {gameResult.dice && !isSpinning.dice && (
                <p className="mt-2 text-lg">{gameResult.dice}</p>
              )}
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="game-header-rps p-2 rounded-t-lg">
                <h2 className="text-xl font-semibold game-rps">Rock Paper Scissors</h2>
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Bet Amount:</label>
                <input
                  type="number"
                  value={bets.rps}
                  onChange={(e) => setBets({ ...bets, rps: Number(e.target.value) })}
                  className="p-1 bg-gray-700 rounded text-white w-20"
                  min="1"
                />
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Your Choice:</label>
                <select
                  value={rpsChoice}
                  onChange={(e) => setRpsChoice(e.target.value)}
                  className="p-1 bg-gray-700 rounded text-white"
                >
                  <option value="Rock">Rock</option>
                  <option value="Paper">Paper</option>
                  <option value="Scissors">Scissors</option>
                </select>
              </div>
              <button
                onClick={playRps}
                className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Play
              </button>
              {gameResult.rps && (
                <p className="mt-2 text-lg">Result: {gameResult.rps}</p>
              )}
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="game-header-spinwheel p-2 rounded-t-lg">
                <h2 className="text-xl font-semibold game-spinwheel">Spin Wheel Game</h2>
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Bet Amount:</label>
                <input
                  type="number"
                  value={bets.spinWheel}
                  onChange={(e) => setBets({ ...bets, spinWheel: Number(e.target.value) })}
                  className="p-1 bg-gray-700 rounded text-white w-20"
                  min="1"
                />
              </div>
              <button
                onClick={playSpinWheel}
                className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                disabled={isSpinning.spinWheel}
              >
                {isSpinning.spinWheel ? "Spinning..." : "Spin"}
              </button>
              {isSpinning.spinWheel && (
                <p className="mt-2 text-lg spin-animation">Wheel Spinning...</p>
              )}
              {gameResult.spinWheel && !isSpinning.spinWheel && (
                <p className="mt-2 text-lg">{gameResult.spinWheel}</p>
              )}
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="game-header-poker p-2 rounded-t-lg">
                <h2 className="text-xl font-semibold game-poker">Poker Game</h2>
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Bet Amount:</label>
                <input
                  type="number"
                  value={bets.poker}
                  onChange={(e) => setBets({ ...bets, poker: Number(e.target.value) })}
                  className="p-1 bg-gray-700 rounded text-white w-20"
                  min="1"
                />
              </div>
              <button
                onClick={playPoker}
                className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Play
              </button>
              {gameResult.poker && (
                <p className="mt-2 text-lg">Result: {gameResult.poker}</p>
              )}
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="game-header-baccarat p-2 rounded-t-lg">
                <h2 className="text-xl font-semibold game-baccarat">Baccarat Game</h2>
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Bet Amount:</label>
                <input
                  type="number"
                  value={bets.baccarat}
                  onChange={(e) => setBets({ ...bets, baccarat: Number(e.target.value) })}
                  className="p-1 bg-gray-700 rounded text-white w-20"
                  min="1"
                />
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Bet On:</label>
                <select
                  value={baccaratChoice}
                  onChange={(e) => setBaccaratChoice(e.target.value)}
                  className="p-1 bg-gray-700 rounded text-white"
                >
                  <option value="Player">Player</option>
                  <option value="Banker">Banker</option>
                </select>
              </div>
              <button
                onClick={playBaccarat}
                className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Play
              </button>
              {gameResult.baccarat && (
                <p className="mt-2 text-lg">Result: {gameResult.baccarat}</p>
              )}
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="game-header-craps p-2 rounded-t-lg">
                <h2 className="text-xl font-semibold game-craps">Craps Game</h2>
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Bet Amount:</label>
                <input
                  type="number"
                  value={bets.craps}
                  onChange={(e) => setBets({ ...bets, craps: Number(e.target.value) })}
                  className="p-1 bg-gray-700 rounded text-white w-20"
                  min="1"
                />
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Bet On:</label>
                <select
                  value={crapsBet}
                  onChange={(e) => setCrapsBet(e.target.value)}
                  className="p-1 bg-gray-700 rounded text-white"
                >
                  <option value="Pass">Pass</option>
                  <option value="Don't Pass">Don't Pass</option>
                </select>
              </div>
              <button
                onClick={playCraps}
                className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                disabled={isSpinning.craps}
              >
                {isSpinning.craps ? "Rolling..." : "Roll"}
              </button>
              {isSpinning.craps && (
                <p className="mt-2 text-lg roll-animation">🎲 🎲</p>
              )}
              {gameResult.craps && !isSpinning.craps && (
                <p className="mt-2 text-lg">{gameResult.craps}</p>
              )}
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="game-header-keno p-2 rounded-t-lg">
                <h2 className="text-xl font-semibold game-keno">Keno Game</h2>
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Bet Amount:</label>
                <input
                  type="number"
                  value={bets.keno}
                  onChange={(e) => setBets({ ...bets, keno: Number(e.target.value) })}
                  className="p-1 bg-gray-700 rounded text-white w-20"
                  min="1"
                />
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Your Numbers (1-80, comma-separated):</label>
                <input
                  type="text"
                  value={kenoNumbers.join(", ")}
                  onChange={(e) => setKenoNumbers(e.target.value.split(",").map(Number).filter(n => n >= 1 && n <= 80).slice(0, 4))}
                  className="p-1 bg-gray-700 rounded text-white w-32"
                />
              </div>
              <button
                onClick={playKeno}
                className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Play
              </button>
              {gameResult.keno && (
                <p className="mt-2 text-lg">Result: {gameResult.keno}</p>
              )}
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="game-header-sicbo p-2 rounded-t-lg">
                <h2 className="text-xl font-semibold game-sicbo">Sic Bo Game</h2>
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Bet Amount:</label>
                <input
                  type="number"
                  value={bets.sicBo}
                  onChange={(e) => setBets({ ...bets, sicBo: Number(e.target.value) })}
                  className="p-1 bg-gray-700 rounded text-white w-20"
                  min="1"
                />
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Bet On:</label>
                <select
                  value={sicBoBet}
                  onChange={(e) => setSicBoBet(e.target.value)}
                  className="p-1 bg-gray-700 rounded text-white"
                >
                  <option value="Big">Big (11-17)</option>
                  <option value="Small">Small (4-10)</option>
                </select>
              </div>
              <button
                onClick={playSicBo}
                className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                disabled={isSpinning.sicBo}
              >
                {isSpinning.sicBo ? "Rolling..." : "Roll"}
              </button>
              {isSpinning.sicBo && (
                <p className="mt-2 text-lg roll-animation">🎲 🎲 🎲</p>
              )}
              {gameResult.sicBo && !isSpinning.sicBo && (
                <p className="mt-2 text-lg">{gameResult.sicBo}</p>
              )}
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="game-header-videopoker p-2 rounded-t-lg">
                <h2 className="text-xl font-semibold game-videopoker">Video Poker Game</h2>
              </div>
              <div className="flex items-center mb-2">
                <label className="mr-2">Bet Amount:</label>
                <input
                  type="number"
                  value={bets.videoPoker}
                  onChange={(e) => setBets({ ...bets, videoPoker: Number(e.target.value) })}
                  className="p-1 bg-gray-700 rounded text-white w-20"
                  min="1"
                />
              </div>
              <button
                onClick={playVideoPoker}
                className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Play
              </button>
              {gameResult.videoPoker && (
                <p className="mt-2 text-lg">Result: {gameResult.videoPoker}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showReferrals && (
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 gradient-text">Referrals</h2>
          <p className="mb-2">Your Referral Link: casino.com/ref/{currentUser.id}</p>
          <button
            onClick={addReferral}
            className="mb-4 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
          >
            Add Referral (Simulated)
          </button>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Referral Tracking</h3>
            <p>Total Referrals: {referralStats.totalReferrals}</p>
            <p>Total Referral Earnings: ${referralStats.totalEarnings.toFixed(2)}</p>
            <p>Level 1 Referrals: {referralStats.level1Count} (Earnings: ${referralStats.level1Earnings.toFixed(2)})</p>
            <p>Level 2 Referrals: {referralStats.level2Count} (Earnings: ${referralStats.level2Earnings.toFixed(2)})</p>
            <p>Level 3 Referrals: {referralStats.level3Count} (Earnings: ${referralStats.level3Earnings.toFixed(2)})</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Your Referral Tree</h3>
            {currentUser.referrals.length > 0 ? (
              currentUser.referrals.map((ref, index) => (
                <div key={index}>{renderTree(ref)}</div>
              ))
            ) : (
              <p>No referrals yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);