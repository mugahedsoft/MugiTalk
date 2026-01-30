
import { storageService } from './storageService';
import type { UserProgress, UserLevel } from '@/types';

export interface LevelMilestone {
    level: number;
    xpRequired: number;
    title: string;
}

const XP_TABLE: LevelMilestone[] = [
    { level: 1, xpRequired: 0, title: 'Beginner' },
    { level: 2, xpRequired: 500, title: 'Novice' },
    { level: 3, xpRequired: 1200, title: 'Apprentice' },
    { level: 4, xpRequired: 2500, title: 'Scholar' },
    { level: 5, xpRequired: 5000, title: 'Wordsmith' },
    { level: 6, xpRequired: 10000, title: 'Sage' },
    { level: 7, xpRequired: 20000, title: 'GemiMaster' }
];

class GamificationService {

    public calculateXP(baseXP: number, accuracy: number, level: UserLevel): number {
        // Multiplier based on proficiency level
        const levelMultiplier = {
            'A1': 1.0,
            'A2': 1.2,
            'B1': 1.5,
            'B2': 1.8,
            'C1': 2.2,
            'C2': 3.0
        }[level];

        // Accuracy bonus (0.5x to 1.5x)
        const accuracyBonus = 0.5 + (accuracy / 100);

        return Math.round(baseXP * levelMultiplier * accuracyBonus);
    }

    public updateProgress(earnedXP: number): { leveledUp: boolean, nextLevel: number } {
        const progress = storageService.getProgress();
        if (!progress) return { leveledUp: false, nextLevel: 1 };

        const newTotalXP = progress.totalXP + earnedXP;
        const currentLevelInfo = this.getLevelFromXP(progress.totalXP);
        const nextLevelInfo = this.getLevelFromXP(newTotalXP);

        const updatedProgress: UserProgress = {
            ...progress,
            totalXP: newTotalXP,
            lastPracticeDate: new Date()
        };

        // Handle Streaks
        this.updateStreak(updatedProgress);

        storageService.setProgress(updatedProgress);

        return {
            leveledUp: nextLevelInfo.level > currentLevelInfo.level,
            nextLevel: nextLevelInfo.level
        };
    }

    public getLevelFromXP(xp: number): LevelMilestone {
        const reversedTable = [...XP_TABLE].reverse();
        const currentM = reversedTable.find(m => xp >= m.xpRequired);
        return currentM || XP_TABLE[0];
    }

    public getNextLevelInfo(xp: number): LevelMilestone | null {
        return XP_TABLE.find(m => m.xpRequired > xp) || null;
    }

    private updateStreak(progress: UserProgress) {
        const lastDate = progress.lastPracticeDate ? new Date(progress.lastPracticeDate) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!lastDate) {
            progress.currentStreak = 1;
            return;
        }

        const lastPractice = new Date(lastDate);
        lastPractice.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - lastPractice.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day
            progress.currentStreak += 1;
            if (progress.currentStreak > progress.longestStreak) {
                progress.longestStreak = progress.currentStreak;
            }
        } else if (diffDays > 1) {
            // Streak broken
            progress.currentStreak = 1;
        }
    }
}

export const gamificationService = new GamificationService();
