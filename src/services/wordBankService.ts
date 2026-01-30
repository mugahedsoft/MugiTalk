
import { storageService } from './storageService';
import type { Sentence } from '@/types';

export interface BoxItem {
    id: string;
    sentence: Sentence;
    lastReviewed: Date;
    nextReview: Date;
    interval: number; // in days
    box: number; // 1 to 5 (Leitner system)
}

class WordBankService {
    private STORAGE_KEY = 'gemitalk_word_bank';

    public addToBank(sentence: Sentence) {
        const bank = this.getBank();
        if (bank.find(item => item.id === sentence.id)) return;

        const newItem: BoxItem = {
            id: sentence.id,
            sentence,
            lastReviewed: new Date(),
            nextReview: new Date(),
            interval: 1,
            box: 1
        };

        bank.push(newItem);
        this.saveBank(bank);
    }

    public getBank(): BoxItem[] {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored).map((item: any) => ({
            ...item,
            lastReviewed: new Date(item.lastReviewed),
            nextReview: new Date(item.nextReview)
        }));
    }

    public getDueItems(): BoxItem[] {
        const now = new Date();
        return this.getBank().filter(item => item.nextReview <= now);
    }

    public updateReview(id: string, success: boolean) {
        const bank = this.getBank();
        const index = bank.findIndex(item => item.id === id);
        if (index === -1) return;

        const item = bank[index];
        if (success) {
            item.box = Math.min(item.box + 1, 5);
            item.interval = Math.pow(2, item.box); // 2, 4, 8, 16, 32 days
        } else {
            item.box = 1;
            item.interval = 1;
        }

        item.lastReviewed = new Date();
        item.nextReview = new Date(Date.now() + item.interval * 24 * 60 * 60 * 1000);

        this.saveBank(bank);
    }

    private saveBank(bank: BoxItem[]) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bank));
    }
}

export const wordBankService = new WordBankService();
