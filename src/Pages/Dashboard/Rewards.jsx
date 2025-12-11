import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import {
  Star,
  Lock,
  Check,
  Share2,
  Trophy,
  TrendingUp,
  Gift,
  Shield
} from 'lucide-react';

const customFontStyle = {
  fontFamily: "'Neue Montreal Regular', sans-serif",
  fontWeight: 600,
  fontStyle: "normal",
};

const Rewards = () => {
  const { user } = useAuth();
  const [rewardsData, setRewardsData] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(
          `${API_BASE_URL}api/v1/matching-income/rewards/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setRewardsData(response.data.data.rewards);
          setCurrentLevel(response.data.data.currentLevel);
          setTotalIncome(response.data.data.totalIncome);
        }
      } catch (err) {
        setError('Failed to load rewards data');
        console.error('Error fetching rewards:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchRewards();
  }, [user]);

  const RewardImage = ({ url, isLocked }) => (
    <div className="relative w-full h-full">
      <img
        src={url}
        alt="Reward"
        className={`w-full h-full rounded-2xl object-cover shadow-lg border-2 transition-all duration-300 hover:scale-105 ${
          isLocked
            ? 'border-gray-300'
            : 'border-blue-200 brightness-110 saturate-110'
        }`}
      />
    </div>
  );

  const Medal3D = () => (
    <div className="relative w-48 h-48 mx-auto my-4 transition-transform hover:scale-105 duration-500 cursor-pointer">
      <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-2xl translate-y-4"></div>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-28 flex justify-center gap-2 -z-10">
        <div className="w-8 h-full bg-gradient-to-b from-rose-500 to-rose-600 rounded-b-lg"></div>
        <div className="w-8 h-full bg-gradient-to-b from-rose-400 to-rose-500 rounded-b-lg mt-3"></div>
      </div>
      <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 shadow-xl flex items-center justify-center border-[6px] border-yellow-200">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tl from-yellow-400 to-yellow-100 shadow-inner flex items-center justify-center">
          <Star className="w-20 h-20 text-white fill-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-md w-full border border-red-100">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800">Unable to load data</h3>
          <p className="text-gray-500 mt-2 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={customFontStyle} className="min-h-screen bg-[#F8FAFC] text-slate-800 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="text-blue-600 text-xs uppercase mb-2 block">Your Journey</span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900">Rewards Program</h1>
            <p className="text-slate-500 mt-2 text-lg">Unlock exclusive perks as you grow.</p>
          </div>

          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Total Income</p>
              <p className="text-2xl font-black text-slate-800">₹{totalIncome.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column */}
          <div className="lg:col-span-4 sticky top-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 text-center relative overflow-hidden">
              <div className="absolute -top-16 -left-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60"></div>

              <Medal3D />

              <div className="mt-8">
                <h2 className="text-2xl font-bold">
                  {currentLevel ? `Level: ${currentLevel.role}` : "Start Your Journey"}
                </h2>
                <p className="text-slate-500 text-sm max-w-[250px] mx-auto mt-2">
                  {currentLevel ? "You've unlocked this badge!" : "Earn income to unlock your first reward."}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="w-full bg-green-100 text-green-800 py-3.5 rounded-xl flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Current Income: ₹{totalIncome.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-200 via-green-300 to-green-200 opacity-60"></div>

            <div className="space-y-8">
              {rewardsData.map((reward, index) => {
                const isActive = reward.isCurrentLevel;
                const isUnlocked = reward.isAchieved && !reward.isLocked;
                const isLocked = reward.isLocked;

                return (
                  <div key={index} className="relative">

                    <div
                      className={`absolute -left-4 top-8 w-4 h-4 rounded-full border-2 ${
                        isActive
                          ? 'bg-blue-500 border-blue-300'
                          : isUnlocked
                            ? 'bg-green-500 border-green-300'
                            : 'bg-gray-300 border-gray-200'
                      }`}
                    ></div>

                    <div
                      className={`group rounded-[2rem] p-6 transition-all border ${
                        isActive
                          ? "bg-white border-blue-200 shadow-lg ring-1 ring-blue-200"
                          : isLocked
                            ? "bg-white/60 border-transparent"
                            : "bg-white border-slate-100"
                      }`}
                    >
                      <div className="flex gap-6 items-center">

                        {/* LEFT 50% */}
                        <div className="w-1/2">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                              isActive
                                ? 'bg-blue-100 text-blue-700'
                                : isUnlocked
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                            }`}>
                              Level {index + 1}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold">{reward.role}</h3>
                          <p className="text-sm text-slate-500 mt-1">
                            Target: ₹{reward.achieve.toLocaleString("en-IN")}
                          </p>

                          <div className="mt-3 pt-3 border-t border-dashed border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Gift className="w-4 h-4 text-slate-500" />
                              <span className="text-xs uppercase text-slate-400">Rewards Included</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {reward.rewards.map((r, i) => (
                                <span key={i} className="text-sm px-3 py-1.5 bg-slate-50 rounded-lg">
                                  {r}
                                </span>
                              ))}
                            </div>

                            {isLocked && reward.lockReason && (
                              <p className="mt-3 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                                🔒 {reward.lockReason}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* RIGHT 50% – IMAGE */}
                        <div className="w-1/2 h-48 flex items-center justify-center">
                          <RewardImage url={reward.imageUrl} isLocked={isLocked} />
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
