import { useState } from 'react';
import { X, Package, Send } from 'lucide-react';
import type { User, PlayerState } from '@shared/schema';

interface TradeModalProps {
  onlinePlayers: User[];
  playerState: PlayerState;
  onClose: () => void;
  onSendTradeOffer: (toUserId: number, offerItems: Record<string, number>, requestItems: Record<string, number>) => void;
}

export default function TradeModal({ onlinePlayers, playerState, onClose, onSendTradeOffer }: TradeModalProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [offerItems, setOfferItems] = useState<Record<string, number>>({});
  const [requestItems, setRequestItems] = useState<Record<string, number>>({});

  const materials = playerState.materials as Record<string, number>;
  const craftedItems = playerState.craftedItems as Record<string, number>;

  const addToOffer = (item: string, isFromCrafted = false) => {
    const available = isFromCrafted ? (craftedItems[item] || 0) : (materials[item] || 0);
    const current = offerItems[item] || 0;
    
    if (current < available) {
      setOfferItems(prev => ({ ...prev, [item]: current + 1 }));
    }
  };

  const removeFromOffer = (item: string) => {
    setOfferItems(prev => {
      const newItems = { ...prev };
      if (newItems[item] <= 1) {
        delete newItems[item];
      } else {
        newItems[item]--;
      }
      return newItems;
    });
  };

  const handleSendOffer = () => {
    if (!selectedPlayer || Object.keys(offerItems).length === 0) return;
    
    onSendTradeOffer(selectedPlayer, offerItems, requestItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Direct Trade</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Player Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Trading Partner
            </label>
            <select 
              value={selectedPlayer || ''}
              onChange={(e) => setSelectedPlayer(e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a player...</option>
              {onlinePlayers.map(player => (
                <option key={player.id} value={player.id}>
                  {player.username} {player.isOnline ? '(Online)' : '(Offline)'}
                </option>
              ))}
            </select>
          </div>

          {/* Trade Interface */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Your Offer */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Your Offer</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-32 bg-gray-50">
                {Object.keys(offerItems).length === 0 ? (
                  <div className="text-center text-gray-500 text-sm">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Select items to offer
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(offerItems).map(([item, quantity]) => (
                      <div key={item} className="flex items-center justify-between bg-white rounded p-2 border">
                        <span className="text-sm">{item} x{quantity}</span>
                        <button 
                          onClick={() => removeFromOffer(item)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Available Items */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Your Items</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {/* Materials */}
                {Object.entries(materials).filter(([_, qty]) => qty > 0).map(([material, quantity]) => (
                  <div key={material} className="flex items-center justify-between bg-blue-50 rounded-lg p-2">
                    <span className="text-sm font-medium">{material.charAt(0).toUpperCase() + material.slice(1)}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">x{quantity}</span>
                      <button 
                        onClick={() => addToOffer(material)}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Crafted Items */}
                {Object.entries(craftedItems).filter(([_, qty]) => qty > 0).map(([itemKey, quantity]) => (
                  <div key={itemKey} className="flex items-center justify-between bg-purple-50 rounded-lg p-2">
                    <span className="text-sm font-medium">Crafted Item</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">x{quantity}</span>
                      <button 
                        onClick={() => addToOffer(itemKey, true)}
                        className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-2 py-1 rounded"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
                
                {Object.entries(materials).filter(([_, qty]) => qty > 0).length === 0 && 
                 Object.entries(craftedItems).filter(([_, qty]) => qty > 0).length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-4">
                    No items available to trade
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trade Actions */}
          <div className="mt-6 flex space-x-4">
            <button 
              onClick={handleSendOffer}
              disabled={!selectedPlayer || Object.keys(offerItems).length === 0}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4 inline mr-2" />
              Send Trade Offer
            </button>
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
