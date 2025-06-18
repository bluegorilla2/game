import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Package, Hammer, ShoppingCart, Users, Zap, Plus, Minus, Beaker, Sparkles, Trash2 } from 'lucide-react';

const TradingGame = () => {
  // Game state
  const [money, setMoney] = useState(10);
  const [clickPower, setClickPower] = useState(1);
  const [materials, setMaterials] = useState({
    hydrogen: 0,
    helium: 0,
    lithium: 0,
    carbon: 0,
    nitrogen: 0,
    oxygen: 0,
    fluorine: 0,
    sodium: 0,
    magnesium: 0,
    aluminum: 0,
    silicon: 0,
    phosphorus: 0,
    sulfur: 0,
    chlorine: 0,
    potassium: 0,
    calcium: 0,
    iron: 0,
    copper: 0,
    zinc: 0,
    silver: 0,
    gold: 0,
    mercury: 0,
    lead: 0,
    uranium: 0,
    water: 0,
    oil: 0,
    acid: 0,
    crystal: 0,
    plasma: 0,
    antimatter: 0,
    darkMatter: 0,
    quantumFoam: 0,
    strangeMatter: 0,
    neutronium: 0,
    photons: 0,
    gravitons: 0,
    tachyons: 0,
    quarks: 0,
    bosons: 0,
    neutrinos: 0
  });
  
  const [unlockedMaterials, setUnlockedMaterials] = useState(['hydrogen', 'carbon', 'oxygen']);
  const [discoveredItems, setDiscoveredItems] = useState({});
  const [craftedItems, setCraftedItems] = useState({});
  const [marketplace, setMarketplace] = useState([]);
  const [selectedTab, setSelectedTab] = useState('clicker');
  const [notifications, setNotifications] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState({});
  const [totalDiscoveries, setTotalDiscoveries] = useState(0);

  // Material prices and tiers
  const materialData = {
    // Basic elements (Tier 1)
    hydrogen: { price: 3, tier: 1, color: 'blue' },
    helium: { price: 5, tier: 1, color: 'purple' },
    lithium: { price: 8, tier: 1, color: 'pink' },
    carbon: { price: 4, tier: 1, color: 'gray' },
    nitrogen: { price: 6, tier: 1, color: 'cyan' },
    oxygen: { price: 4, tier: 1, color: 'red' },
    fluorine: { price: 10, tier: 1, color: 'green' },
    
    // Common elements (Tier 2)
    sodium: { price: 15, tier: 2, color: 'yellow' },
    magnesium: { price: 20, tier: 2, color: 'white' },
    aluminum: { price: 25, tier: 2, color: 'silver' },
    silicon: { price: 30, tier: 2, color: 'blue' },
    phosphorus: { price: 35, tier: 2, color: 'orange' },
    sulfur: { price: 28, tier: 2, color: 'yellow' },
    chlorine: { price: 32, tier: 2, color: 'green' },
    
    // Metals (Tier 3)
    potassium: { price: 45, tier: 3, color: 'purple' },
    calcium: { price: 50, tier: 3, color: 'white' },
    iron: { price: 60, tier: 3, color: 'gray' },
    copper: { price: 70, tier: 3, color: 'orange' },
    zinc: { price: 80, tier: 3, color: 'blue' },
    
    // Precious (Tier 4)
    silver: { price: 150, tier: 4, color: 'silver' },
    gold: { price: 300, tier: 4, color: 'yellow' },
    mercury: { price: 200, tier: 4, color: 'silver' },
    lead: { price: 120, tier: 4, color: 'gray' },
    uranium: { price: 500, tier: 4, color: 'green' },
    
    // Compounds (Tier 5)
    water: { price: 50, tier: 5, color: 'blue' },
    oil: { price: 100, tier: 5, color: 'black' },
    acid: { price: 150, tier: 5, color: 'green' },
    crystal: { price: 400, tier: 5, color: 'purple' },
    plasma: { price: 800, tier: 5, color: 'orange' },
    
    // Exotic (Tier 6)
    antimatter: { price: 2000, tier: 6, color: 'purple' },
    darkMatter: { price: 3000, tier: 6, color: 'black' },
    quantumFoam: { price: 5000, tier: 6, color: 'cyan' },
    strangeMatter: { price: 4000, tier: 6, color: 'red' },
    neutronium: { price: 6000, tier: 6, color: 'white' },
    
    // Quantum (Tier 7)
    photons: { price: 1000, tier: 7, color: 'yellow' },
    gravitons: { price: 8000, tier: 7, color: 'purple' },
    tachyons: { price: 10000, tier: 7, color: 'blue' },
    quarks: { price: 7000, tier: 7, color: 'red' },
    bosons: { price: 9000, tier: 7, color: 'green' },
    neutrinos: { price: 12000, tier: 7, color: 'white' }
  };

  // Generate combination value based on materials
  const calculateCombinationValue = (mats) => {
    const entries = Object.entries(mats);
    if (entries.length === 0) return 0;
    
    // Check for known bad combinations
    if (mats.sodium && mats.water) return 0; // Explosive = trash
    if (mats.acid && mats.water && entries.length === 2) return 0; // Diluted acid = trash
    if (mats.antimatter && mats.matter) return 0; // Annihilation = trash
    
    // Calculate base value
    let totalValue = 0;
    let totalTier = 0;
    let complexity = entries.length;
    
    entries.forEach(([mat, qty]) => {
      if (materialData[mat]) {
        totalValue += materialData[mat].price * qty;
        totalTier += materialData[mat].tier * qty;
      }
    });
    
    // Apply multipliers for complexity and tier synergy
    const avgTier = totalTier / entries.reduce((sum, [_, qty]) => sum + qty, 0);
    const complexityBonus = Math.pow(1.3, complexity - 1);
    const tierBonus = Math.pow(1.2, avgTier - 1);
    
    // Special combinations get huge bonuses
    if (mats.gold && mats.mercury) totalValue *= 2; // Alchemy bonus
    if (mats.uranium && mats.plasma) totalValue *= 3; // Nuclear fusion
    if (mats.darkMatter && mats.antimatter) totalValue *= 5; // Exotic matter
    if (mats.quarks && mats.bosons && mats.gravitons) totalValue *= 10; // Theory of everything
    
    return Math.floor(totalValue * complexityBonus * tierBonus);
  };

  // Generate item name based on materials
  const generateItemName = (mats) => {
    const entries = Object.entries(mats).sort((a, b) => b[1] - a[1]);
    
    // Special named items
    if (mats.sodium && mats.water) return "Trash (Explosion Residue)";
    if (mats.hydrogen && mats.oxygen && entries.length === 2) return "Pure Water";
    if (mats.carbon && mats.iron && entries.length === 2) return "Steel";
    if (mats.copper && mats.zinc && entries.length === 2) return "Brass";
    if (mats.gold && mats.silver && entries.length === 2) return "Electrum";
    if (mats.uranium && mats.plasma) return "Fusion Core";
    if (mats.darkMatter && mats.antimatter) return "Void Crystal";
    if (mats.quarks && mats.bosons && mats.gravitons) return "Unified Field";
    
    // Generate procedural names
    const prefixes = ['Refined', 'Pure', 'Enriched', 'Stabilized', 'Quantum', 'Exotic', 'Hyper', 'Meta', 'Ultra', 'Omega'];
    const suffixes = ['Compound', 'Alloy', 'Crystal', 'Matrix', 'Composite', 'Element', 'Substance', 'Material', 'Catalyst', 'Reagent'];
    
    const mainMat = entries[0][0];
    const prefix = prefixes[Math.floor((totalDiscoveries * 7) % prefixes.length)];
    const suffix = suffixes[Math.floor((totalDiscoveries * 13) % suffixes.length)];
    
    return `${prefix} ${mainMat.charAt(0).toUpperCase() + mainMat.slice(1)} ${suffix}`;
  };

  // Button upgrade costs
  const getUpgradeCost = () => Math.floor(10 * Math.pow(1.5, clickPower - 1));

  // Add notification
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Money button click
  const handleMoneyClick = () => {
    setMoney(prev => prev + clickPower);
  };

  // Upgrade button
  const upgradeButton = () => {
    const cost = getUpgradeCost();
    if (money >= cost) {
      setMoney(prev => prev - cost);
      setClickPower(prev => prev + 1);
      addNotification(`Button upgraded! Now earning $${clickPower + 1} per click`, 'success');
    }
  };

  // Buy material
  const buyMaterial = (material) => {
    const price = materialData[material].price;
    if (money >= price) {
      setMoney(prev => prev - price);
      setMaterials(prev => ({ ...prev, [material]: prev[material] + 1 }));
      
      // Unlock new materials based on purchases
      const totalMaterials = Object.values(materials).reduce((a, b) => a + b, 0);
      
      if (totalMaterials >= 5 && !unlockedMaterials.includes('sodium')) {
        setUnlockedMaterials(prev => [...prev, 'sodium', 'magnesium', 'aluminum']);
        addNotification('New materials unlocked!', 'unlock');
      }
      if (totalMaterials >= 20 && !unlockedMaterials.includes('iron')) {
        setUnlockedMaterials(prev => [...prev, 'silicon', 'phosphorus', 'sulfur', 'chlorine', 'iron', 'copper']);
        addNotification('Metals unlocked!', 'unlock');
      }
      if (totalMaterials >= 50 && !unlockedMaterials.includes('silver')) {
        setUnlockedMaterials(prev => [...prev, 'potassium', 'calcium', 'zinc', 'silver', 'gold']);
        addNotification('Precious metals unlocked!', 'unlock');
      }
      if (totalMaterials >= 100 && !unlockedMaterials.includes('water')) {
        setUnlockedMaterials(prev => [...prev, 'mercury', 'lead', 'uranium', 'water', 'oil', 'acid']);
        addNotification('Compounds unlocked!', 'unlock');
      }
      if (totalDiscoveries >= 20 && !unlockedMaterials.includes('plasma')) {
        setUnlockedMaterials(prev => [...prev, 'crystal', 'plasma']);
        addNotification('Advanced materials unlocked!', 'unlock');
      }
      if (totalDiscoveries >= 50 && !unlockedMaterials.includes('antimatter')) {
        setUnlockedMaterials(prev => [...prev, 'antimatter', 'darkMatter']);
        addNotification('Exotic matter unlocked!', 'unlock');
      }
      if (totalDiscoveries >= 100 && !unlockedMaterials.includes('photons')) {
        setUnlockedMaterials(prev => [...prev, 'quantumFoam', 'strangeMatter', 'neutronium', 'photons', 'gravitons', 'tachyons', 'quarks', 'bosons', 'neutrinos']);
        addNotification('Quantum particles unlocked!', 'unlock');
      }
    }
  };

  // Toggle material selection for crafting
  const toggleMaterial = (material, amount = 1) => {
    setSelectedMaterials(prev => {
      const current = prev[material] || 0;
      const available = materials[material] || 0;
      
      if (current + amount > available) return prev;
      if (current + amount < 0) {
        const { [material]: _, ...rest } = prev;
        return rest;
      }
      
      if (current + amount === 0) {
        const { [material]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [material]: current + amount };
    });
  };

  // Craft with selected materials
  const craftWithSelection = () => {
    if (Object.keys(selectedMaterials).length === 0) return;
    
    // Check if player has the materials
    const canCraft = Object.entries(selectedMaterials).every(([mat, amt]) => 
      materials[mat] >= amt
    );
    
    if (!canCraft) {
      addNotification('Not enough materials!', 'error');
      return;
    }
    
    // Generate item
    const itemKey = Object.entries(selectedMaterials)
      .sort()
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    
    const itemName = generateItemName(selectedMaterials);
    const itemValue = calculateCombinationValue(selectedMaterials);
    
    // Deduct materials
    const newMaterials = { ...materials };
    Object.entries(selectedMaterials).forEach(([mat, amt]) => {
      newMaterials[mat] -= amt;
    });
    setMaterials(newMaterials);
    
    // Add to discovered items if new
    if (!discoveredItems[itemKey]) {
      setDiscoveredItems(prev => ({
        ...prev,
        [itemKey]: {
          name: itemName,
          value: itemValue,
          materials: { ...selectedMaterials },
          discovered: new Date()
        }
      }));
      setTotalDiscoveries(prev => prev + 1);
      
      if (itemValue === 0) {
        addNotification(`Discovered "${itemName}" - Worthless!`, 'error');
      } else {
        addNotification(`New discovery: "${itemName}" worth $${itemValue}!`, 'unlock');
      }
    }
    
    // Add to inventory
    setCraftedItems(prev => ({
      ...prev,
      [itemKey]: (prev[itemKey] || 0) + 1
    }));
    
    // Clear selection
    setSelectedMaterials({});
  };

  // Sell item
  const sellItem = (itemKey, item) => {
    if (craftedItems[itemKey] && craftedItems[itemKey] > 0) {
      setCraftedItems(prev => ({
        ...prev,
        [itemKey]: prev[itemKey] - 1
      }));

      const variance = 0.3;
      const price = Math.floor(item.value * (1 + (Math.random() - 0.5) * variance));

      const listing = {
        id: Date.now(),
        item: item.name,
        price: price,
        seller: 'You',
        timestamp: new Date()
      };

      setMarketplace(prev => [...prev, listing]);
      
      // Simulate instant buy
      setTimeout(() => {
        setMoney(prev => prev + price);
        setMarketplace(prev => prev.filter(l => l.id !== listing.id));
        addNotification(`${item.name} sold for $${price}!`, 'success');
      }, Math.random() * 3000 + 1000);
    }
  };

  // Simulate other players
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3 && Object.keys(discoveredItems).length > 0) {
        const items = Object.entries(discoveredItems);
        const [key, item] = items[Math.floor(Math.random() * items.length)];
        const variance = 0.3;
        const price = Math.floor(item.value * (1 + (Math.random() - 0.5) * variance));
        
        const listing = {
          id: Date.now() + Math.random(),
          item: item.name,
          price: price,
          seller: `Player${Math.floor(Math.random() * 100)}`,
          timestamp: new Date()
        };
        
        setMarketplace(prev => [...prev.slice(-19), listing]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [discoveredItems]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Universal Trading Empire
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xl">
          <span className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
            💰 ${money.toLocaleString()}
          </span>
          <span className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
            ⚡ Power: {clickPower}
          </span>
          <span className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
            🧪 Discoveries: {totalDiscoveries}/999+
          </span>
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`px-4 py-2 rounded-lg shadow-lg animate-pulse ${
              notif.type === 'success' ? 'bg-green-600' :
              notif.type === 'unlock' ? 'bg-purple-600' :
              notif.type === 'error' ? 'bg-red-600' :
              'bg-blue-600'
            }`}
          >
            {notif.message}
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
          {['clicker', 'materials', 'laboratory', 'discoveries', 'marketplace'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                selectedTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {/* Clicker Tab */}
        {selectedTab === 'clicker' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Zap className="text-yellow-400" />
                Money Generator
              </h2>
              <button
                onClick={handleMoneyClick}
                className="w-full py-8 px-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-4xl font-bold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all shadow-lg"
              >
                Click for ${clickPower}
              </button>
              <button
                onClick={upgradeButton}
                disabled={money < getUpgradeCost()}
                className={`w-full mt-4 py-3 px-4 rounded-lg font-semibold transition-all ${
                  money >= getUpgradeCost()
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Upgrade (Cost: ${getUpgradeCost()})
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Materials</span>
                  <span>{Object.values(materials).reduce((a, b) => a + b, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Items Crafted</span>
                  <span>{Object.values(craftedItems).reduce((a, b) => a + b, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Unique Discoveries</span>
                  <span>{totalDiscoveries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Listings</span>
                  <span>{marketplace.filter(l => l.seller === 'You').length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Materials Tab */}
        {selectedTab === 'materials' && (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6, 7].map(tier => {
              const tierMaterials = Object.entries(materialData).filter(([_, data]) => data.tier === tier);
              const anyUnlocked = tierMaterials.some(([mat]) => unlockedMaterials.includes(mat));
              
              if (!anyUnlocked) return null;
              
              return (
                <div key={tier}>
                  <h3 className="text-xl font-bold mb-3">Tier {tier} Materials</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {tierMaterials.map(([material, data]) => {
                      const isUnlocked = unlockedMaterials.includes(material);
                      if (!isUnlocked) return null;
                      
                      return (
                        <div
                          key={material}
                          className="bg-gray-800 rounded-lg p-3 border border-gray-700"
                        >
                          <h4 className="text-sm font-semibold capitalize mb-1">{material}</h4>
                          <div className="text-xl font-bold mb-1">{materials[material]}</div>
                          <button
                            onClick={() => buyMaterial(material)}
                            disabled={money < data.price}
                            className={`w-full py-1 px-2 rounded text-sm font-semibold transition-all ${
                              money >= data.price
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Buy (${data.price})
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Laboratory Tab */}
        {selectedTab === 'laboratory' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Beaker className="text-green-400" />
                Material Selection
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Object.entries(materials).map(([mat, qty]) => {
                  if (qty === 0) return null;
                  const selected = selectedMaterials[mat] || 0;
                  
                  return (
                    <div key={mat} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                      <span className="capitalize">{mat}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Available: {qty}</span>
                        <button
                          onClick={() => toggleMaterial(mat, -1)}
                          disabled={selected === 0}
                          className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded disabled:bg-gray-600"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{selected}</span>
                        <button
                          onClick={() => toggleMaterial(mat, 1)}
                          disabled={selected >= qty}
                          className="w-8 h-8 bg-green-600 hover:bg-green-700 rounded disabled:bg-gray-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="text-purple-400" />
                Experiment
              </h2>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Selected Materials:</h3>
                {Object.entries(selectedMaterials).length === 0 ? (
                  <p className="text-gray-500">Select materials to craft</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedMaterials).map(([mat, qty]) => (
                      <span key={mat} className="bg-gray-700 px-3 py-1 rounded">
                        {mat} x{qty}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={craftWithSelection}
                disabled={Object.keys(selectedMaterials).length === 0}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  Object.keys(selectedMaterials).length > 0
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Craft Mystery Item
              </button>
              
              <div className="mt-4 text-sm text-gray-400">
                <p>Tip: Experiment with different combinations!</p>
                <p>Some combinations create trash (worth $0)</p>
                <p>Special combinations have bonus multipliers!</p>
              </div>
            </div>
          </div>
        )}

        {/* Discoveries Tab */}
        {selectedTab === 'discoveries' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Package className="text-orange-400" />
              Discovered Items ({totalDiscoveries}/999+)
            </h2>
            
            {Object.entries(discoveredItems).length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No discoveries yet. Start experimenting in the Laboratory!
              </p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(discoveredItems).map(([key, item]) => {
                  const count = craftedItems[key] || 0;
                  
                  return (
                    <div key={key} className="bg-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{item.name}</h3>
                      <div className="text-sm text-gray-400 mb-2">
                        Value: ${item.value}
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        Recipe: {Object.entries(item.materials).map(([m, q]) => `${m} x${q}`).join(', ')}
                      </div>
                      {count > 0 && (
                        <button
                          onClick={() => sellItem(key, item)}
                          className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 rounded text-sm font-semibold transition-all"
                        >
                          Sell ({count} owned)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Marketplace Tab */}
        {selectedTab === 'marketplace' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="text-blue-400" />
                Live Marketplace
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-700">
                  <tr className="text-left text-gray-400">
                    <th className="p-4">Item</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Seller</th>
                    <th className="p-4">Listed</th>
                  </tr>
                </thead>
                <tbody>
                  {marketplace.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-500">
                        No active listings. Discover and sell items!
                      </td>
                    </tr>
                  ) : (
                    marketplace.slice(-20).reverse().map(listing => (
                      <tr key={listing.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="p-4 font-semibold">{listing.item}</td>
                        <td className="p-4">
                          <span className="text-green-400">${listing.price}</span>
                        </td>
                        <td className="p-4">
                          <span className={listing.seller === 'You' ? 'text-blue-400' : ''}>
                            {listing.seller}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400">
                          {new Date(listing.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingGame;