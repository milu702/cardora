import React, { useState } from 'react';
import LiveAuctionsList from './LiveAuctionsList';
import AuctionDetailView from './AuctionDetailView';
import MyAuctionsTab from './MyAuctionsTab';
import CreateAuctionModal from './CreateAuctionModal';

const AuctionModule = ({ user, onToast }) => {
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'my_auctions'
  const [selectedAuctionId, setSelectedAuctionId] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleSelectAuction = (auction) => {
    setSelectedAuctionId(auction._id || auction.id);
    setView('detail');
  };

  const handleBack = () => {
    setSelectedAuctionId(null);
    setView('list');
  };

  return (
    <div className="w-full">
      {view === 'list' && (
        <LiveAuctionsList
          user={user}
          onToast={onToast}
          onSelectAuction={handleSelectAuction}
          onCreateClick={() => setCreateModalOpen(true)}
          onMyAuctionsClick={() => setView('my_auctions')}
        />
      )}

      {view === 'detail' && selectedAuctionId && (
        <AuctionDetailView
          auctionId={selectedAuctionId}
          user={user}
          onToast={onToast}
          onBack={handleBack}
        />
      )}

      {view === 'my_auctions' && (
        <div className="space-y-6">
          <button
            onClick={() => setView('list')}
            className="text-xs font-black text-[#1F5E3B] dark:text-emerald-400 hover:underline cursor-pointer"
          >
            ← Back to All Live Auctions
          </button>
          <MyAuctionsTab
            onToast={onToast}
            onSelectAuction={handleSelectAuction}
            onCreateClick={() => setCreateModalOpen(true)}
          />
        </div>
      )}

      {/* CREATE AUCTION MULTI-STEP MODAL */}
      <CreateAuctionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        user={user}
        onToast={onToast}
        onAuctionCreated={(newAuction) => {
          if (newAuction) {
            if (newAuction.status === 'PENDING_APPROVAL') {
              setView('my_auctions');
            } else {
              handleSelectAuction(newAuction);
            }
          }
        }}
      />
    </div>
  );
};

export default AuctionModule;
