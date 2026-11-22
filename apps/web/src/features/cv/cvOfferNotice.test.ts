import { describe, expect, test } from 'vitest';
import { currentCvNoticeOffer } from './cvOfferNotice';

const inspemon = { id: 'offer-inspemon', company: 'Inspemon', title: 'Robotics & Computer Vision Engineer (ROS)' };
const thales = { id: 'external:thales:ai-data:R0343178', company: 'Thales Alenia Space', title: 'Intelligence Artificielle & Analyse de données' };

describe('CV offer notice', () => {
  test('shows the active offer, not the last application reviewed', () => {
    expect(currentCvNoticeOffer(thales.id, thales, true)).toEqual(thales);
    expect(currentCvNoticeOffer(thales.id, inspemon, true)).toBeNull();
  });

  test('never shows the previous offer on a master CV', () => {
    expect(currentCvNoticeOffer(null, inspemon, true)).toBeNull();
  });

  test('stays hidden while an offer-specific CV is loading', () => {
    expect(currentCvNoticeOffer(inspemon.id, inspemon, false)).toBeNull();
  });

  test('rejects missing or inconsistent offer metadata', () => {
    expect(currentCvNoticeOffer(inspemon.id, null, true)).toBeNull();
    expect(currentCvNoticeOffer(inspemon.id, { ...inspemon, title: '' }, true)).toBeNull();
  });
});
