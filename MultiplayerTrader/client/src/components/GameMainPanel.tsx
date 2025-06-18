import { useState } from 'react';
import { Zap, Package, Hammer, TrendingUp, DollarSign, Sparkles, Users } from 'lucide-react';
import type { PlayerState, MarketListing } from '@shared/schema';

interface GameMainPanelProps {
  playerState: PlayerState;
  marketListings: (MarketListing & { seller: any })[];
  onGameAction: (action: string, data?: any) => void;
  onSellToMarket: (itemData: any) => void;
  onBuyFromMarket: (listingId: number) => void;
  onOpenDirectTrade: () => void;
}

const materialData = {
  hydrogen: { price: 3, tier: 1, color: 'blue' },
  helium: { price: 5, tier: 1, color: 'purple' },
  carbon: { price: 4, tier: 1, color: 'gray' },
  nitrogen: { price: 6, tier: 1, color: 'cyan' },
  oxygen: { price: 4, tier: 1, color: 'red' },
  sodium: { price: 15, tier: 2, color: 'yellow' },
  magnesium: { price: 20, tier: 2, color: 'white' },
  aluminum: { price: 25, tier: 2, color: 'silver' },
  iron: { price: 60, tier: 3, color: 'gray' },
  copper: { price: 70, tier: 3, color: 'orange' },
  gold: { price: 300, tier: 4, color: 'yellow' },
  silver: { price: 150, tier: 4, color: 'silver' },
  uranium: { price: 500, tier: 4, color: 'green' },
} as const;

export default function GameMainPanel({ 
  playerState, 
  marketListings, 
  onGameAction, 
  onSellToMarket, 
  onBuyFromMarket,
  onOpenDirectTrade 
}: GameMainPanelProps) {
  const [activeTab, setActiveTab] = useState('clicker');
  const [selectedMaterials, setSelectedMaterials] = useState<Record<string, number>>({});

  const getUpgradeCost = () => Math.floor(10 * Math.pow(1.5, playerState.clickPower - 1));

  const materials = playerState.materials as Record<string, number>;
  const craftedItems = playerState.craftedItems as Record<string, number>;
  const discoveredItems = playerState.discoveredItems as Record<string, any>;

  const toggleMaterial = (material: string, amount = 1) => {
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

  const calculateCombinationValue = (mats: Record<string, number>) => {
    const entries = Object.entries(mats);
    if (entries.length === 0) return 0;
    
    let totalValue = 0;
    let totalTier = 0;
    let complexity = entries.length;
    
    entries.forEach(([mat, qty]) => {
      if (materialData[mat as keyof typeof materialData]) {
        const data = materialData[mat as keyof typeof materialData];
        totalValue += data.price * qty;
        totalTier += data.tier * qty;
      }
    });
    
    const avgTier = totalTier / entries.reduce((sum, [_, qty]) => sum + qty, 0);
    const complexityBonus = Math.pow(1.3, complexity - 1);
    const tierBonus = Math.pow(1.2, avgTier - 1);
    
    return Math.floor(totalValue * complexityBonus * tierBonus);
  };

  const generateItemName = (mats: Record<string, number>) => {
    const entries = Object.entries(mats).sort((a, b) => b[1] - a[1]);
    
    if (mats.hydrogen && mats.oxygen && entries.length === 2) return "Pure Water";
    if (mats.carbon && mats.iron && entries.length === 2) return "Steel";
    if (mats.copper && mats.zinc && entries.length === 2) return "Brass";
    if (mats.gold && mats.silver && entries.length === 2) return "Electrum";
    
    const prefixes = ['Refined', 'Pure', 'Enriched', 'Stabilized', 'Quantum', 'Exotic'];
    const suffixes = ['Compound', 'Alloy', 'Crystal', 'Matrix', 'Composite', 'Element'];
    
    const mainMat = entries[0][0];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix} ${mainMat.charAt(0).toUpperCase() + mainMat.slice(1)} ${suffix}`;
  };

  const craftWithSelection = () => {
    if (Object.keys(selectedMaterials).length === 0) return;
    
    const itemName = generateItemName(selectedMaterials);
    const itemValue = calculateCombinationValue(selectedMaterials);
    
    onGameAction('craft_item', {
      selectedMaterials,
      itemName,
      itemValue
    });
    
    setSelectedMaterials({});
  };

  const sellItem = (itemKey: string) => {
    const item = discoveredItems[itemKey];
    if (!item || !craftedItems[itemKey] || craftedItems[itemKey] <= 0) return;
    
    const variance = 0.3;
    const price = Math.floor(item.value * (1 + (Math.random() - 0.5) * variance));
    
    onSellToMarket({
      itemKey,
      itemName: item.name,
      itemValue: item.value,
      materials: item.materials,
      price
    });
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1m ago';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    return diffHours < 24 ? `${diffHours}h ago` : '1d+ ago';
  };

  return (
    <div className="lg:col-span-2 space-y-4">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'clicker', label: 'Clicker', icon: Zap },
            { id: 'materials', label: 'Materials', icon: Package },
            { id: 'crafting', label: 'Crafting', icon: Hammer },
            { id: 'market', label: 'Market', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 inline mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Clicker Tab */}
          {activeTab === 'clicker' && (
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Money</h2>
                <p className="text-gray-600">Click the button to earn money for trading</p>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={() => onGameAction('click_money')}
                  className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center group"
                >
                  <div className="text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-1 group-active:scale-90 transition-transform" />
                    <div className="text-sm font-medium">Click Me!</div>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold font-mono text-emerald-600">
                    ${playerState.clickPower}
                  </div>
                  <div className="text-sm text-emerald-600">Per Click</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold font-mono text-blue-600">
                    {playerState.totalDiscoveries}
                  </div>
                  <div className="text-sm text-blue-600">Discoveries</div>
                </div>
              </div>

              <button
                onClick={() => onGameAction('upgrade_click')}
                disabled={playerState.money < getUpgradeCost()}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                <TrendingUp className="w-5 h-5 inline mr-2" />
                Upgrade Click Power - <span className="font-mono">${getUpgradeCost()}</span>
              </button>
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Buy Materials</h2>
                <p className="text-gray-600">Purchase raw materials for crafting</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Basic Elements</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(materialData).filter(([_, data]) => data.tier <= 2).map(([material, data]) => (
                      <div
                        key={material}
                        className={`bg-${data.color}-50 border border-${data.color}-200 rounded-lg p-3 text-center hover:bg-${data.color}-100 transition-colors`}
                      >
                        <div className={`font-medium text-${data.color}-800 mb-1`}>
                          {material.charAt(0).toUpperCase() + material.slice(1)}
                        </div>
                        <div className={`text-xs text-${data.color}-600 mb-2`}>
                          Owned: {materials[material] || 0}
                        </div>
                        <button
                          onClick={() => onGameAction('buy_material', { material })}
                          disabled={playerState.money < data.price}
                          className={`w-full bg-${data.color}-500 hover:bg-${data.color}-600 disabled:bg-gray-300 text-white text-sm py-1 px-2 rounded font-medium transition-colors`}
                        >
                          Buy - <span className="font-mono">${data.price}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Advanced Materials</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(materialData).filter(([_, data]) => data.tier > 2).map(([material, data]) => (
                      <div
                        key={material}
                        className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center hover:bg-purple-100 transition-colors"
                      >
                        <div className="font-medium text-purple-800 mb-1">
                          {material.charAt(0).toUpperCase() + material.slice(1)}
                        </div>
                        <div className="text-xs text-purple-600 mb-2">
                          Owned: {materials[material] || 0}
                        </div>
                        <button
                          onClick={() => onGameAction('buy_material', { material })}
                          disabled={playerState.money < data.price}
                          className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white text-sm py-1 px-2 rounded font-medium transition-colors"
                        >
                          Buy - <span className="font-mono">${data.price}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Crafting Tab */}
          {activeTab === 'crafting' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Craft Items</h2>
                <p className="text-gray-600">Combine materials to create valuable items</p>
              </div>

              {/* Selected Materials */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Selected Materials</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {Object.entries(selectedMaterials).map(([material, quantity]) => (
                    <div key={material} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm text-center">
                      {material} x{quantity}
                      <button 
                        onClick={() => toggleMaterial(material, -quantity)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {Object.keys(selectedMaterials).length === 0 && (
                    <div className="col-span-full text-center text-gray-500 text-sm py-2">
                      No materials selected
                    </div>
                  )}
                </div>
                <button
                  onClick={craftWithSelection}
                  disabled={Object.keys(selectedMaterials).length === 0}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Craft Item
                </button>
              </div>

              {/* Available Materials */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Your Materials</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(materials).filter(([_, qty]) => qty > 0).map(([material, quantity]) => (
                    <div key={material} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">
                          {material.charAt(0).toUpperCase() + material.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">x{quantity}</span>
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => toggleMaterial(material, 1)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-1 px-2 rounded transition-colors"
                        >
                          +1
                        </button>
                        <button 
                          onClick={() => toggleMaterial(material, 5)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-1 px-2 rounded transition-colors"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {Object.entries(materials).filter(([_, qty]) => qty > 0).length === 0 && (
                    <div className="col-span-full text-center text-gray-500 text-sm py-4">
                      No materials available. Buy some from the Materials tab.
                    </div>
                  )}
                </div>
              </div>

              {/* Discovered Items */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Your Crafted Items</h3>
                <div className="space-y-2">
                  {Object.entries(craftedItems).filter(([_, qty]) => qty > 0).map(([itemKey, quantity]) => {
                    const item = discoveredItems[itemKey];
                    if (!item) return null;
                    
                    return (
                      <div key={itemKey} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                          <div className="font-medium text-gray-800">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            Quantity: <span>{quantity}</span> | Value: <span className="font-mono text-green-600">${item.value}</span> each
                          </div>
                        </div>
                        <button 
                          onClick={() => sellItem(itemKey)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded font-medium text-sm transition-colors"
                        >
                          Sell
                        </button>
                      </div>
                    );
                  })}
                  
                  {Object.entries(craftedItems).filter(([_, qty]) => qty > 0).length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-4">
                      No crafted items yet. Start crafting to create items!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Market Tab */}
          {activeTab === 'market' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Global Marketplace</h2>
                  <p className="text-gray-600">Buy and sell items with other players</p>
                </div>
                <button 
                  onClick={onOpenDirectTrade}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Direct Trade
                </button>
              </div>

              <div className="space-y-3">
                {marketListings.map((listing) => (
                  <div key={listing.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{listing.itemName}</div>
                          <div className="text-sm text-gray-500">
                            Seller: <span className="font-medium text-blue-600">{listing.seller.username}</span> • 
                            <span className="ml-1">{formatTimeAgo(listing.createdAt!)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold font-mono text-green-600">${listing.price}</div>
                        <button 
                          onClick={() => onBuyFromMarket(listing.id)}
                          disabled={playerState.money < listing.price}
                          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-1 rounded font-medium text-sm transition-colors mt-1"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {marketListings.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-8">
                    No items in the marketplace yet. Be the first to sell something!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
