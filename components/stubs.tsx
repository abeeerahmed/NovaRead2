import React from 'react';

const Stub = (name: string) => (() => <div><p>{name}</p></div>);

export const RichTextEditor = Stub('RichTextEditor');
export const SEOHead = Stub('SEOHead');
export const JSONLDSchema = Stub('JSONLDSchema');
export const VoteButton = Stub('VoteButton');
export const SaveButton = Stub('SaveButton');
export const ReviewSection = Stub('ReviewSection');
export const CommentSection = Stub('CommentSection');

const ProfilePage = () => <div>Profile Page</div>;
const RankingsPage = () => <div>Rankings Page</div>;
const LibraryPage = () => <div>Library Page</div>;
const SearchResultsPage = () => <div>Search Results</div>;
const ForgotPasswordPage = () => <div>Forgot Password</div>;

export { ProfilePage, RankingsPage, LibraryPage, SearchResultsPage, ForgotPasswordPage };
