import React from 'react';
import { Outlet } from 'react-router-dom';
import Icon from '../components/icon/icon.component';

const DefaultLayout: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <nav className="navbar bg-base-100/90 py-2 print:hidden text-base-content sticky top-0 z-30 flex h-16 w-full justify-between backdrop-blur transition-shadow duration-100 [transform:translate3d(0,0,0)] shadow-xs">
                <div className='flex justify-between w-8/10 mx-auto'>
                    <div className="btn btn-ghost">
                        <button className="btn-square bg-primary rounded-2xl">
                            <Icon name="game" className="text-4xl text-base-100" />
                        </button>
                        <div className="text-start">
                            <p className="text-xl font-bold text-white">RocketBet</p>
                            <p className="capitalize text-xs font-extralight text-gray-500">
                                BETTING WEBSITE
                            </p>
                        </div>
                    </div>
                    <div className="space-x-3">
                        <button className="btn btn-primary">
                            <Icon name={"wallet"} className="text-2xl" /> Connect Wallet
                        </button>
                        <button className="btn btn-outline btn-primary">Sign in</button>
                    </div>
                </div>
            </nav>

            <main className="flex-grow max-w-8/10 mx-auto">
                <Outlet />
            </main>

        </div>
    );
};

export default DefaultLayout; 