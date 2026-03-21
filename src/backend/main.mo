import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Time "mo:core/Time";
import Order "mo:core/Order";



actor {
  include MixinStorage();
  // ─── Profile Types ───────────────────────────────────────────────

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let ADMIN_PASSWORD = "worldmossaic9876##";

  type Profile = {
    id : Nat;
    name : Text;
    country : Text;
    photoUrl : Text;
    bio : Text;
    email : ?Text;
    socialMedia : ?Text;
    createdAt : Int;
  };

  module Profile {
    public func compare(p1 : Profile, p2 : Profile) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  func compareCountryTuple(t1 : (Text, Nat), t2 : (Text, Nat)) : Order.Order {
    Text.compare(t1.0, t2.0);
  };

  type Review = {
    id : Nat;
    profileId : Nat;
    authorName : Text;
    rating : Nat;
    comment : Text;
    createdAt : Int;
  };

  var nextId = 1;
  var nextReviewId = 1;
  let profiles = Map.empty<Nat, Profile>();
  let reviews = Map.empty<Nat, Review>();
  let likeCounts = Map.empty<Nat, Nat>();

  // ─── Social: User Accounts ────────────────────────────────────────────────

  type SocialUser = {
    id : Nat;
    username : Text;
    passwordHash : Text;
    displayName : Text;
    email : Text;
    country : Text;
    bio : Text;
    avatarUrl : Text;
    userType : Text;
    stageName : ?Text;
    portfolioLink : ?Text;
    activityScore : Int;
    createdAt : Int;
    isVerified : Bool;
  };

  type Post = {
    id : Nat;
    authorId : Nat;
    imageUrl : Text;
    caption : Text;
    createdAt : Int;
  };

  func comparePostsDesc(p1 : Post, p2 : Post) : Order.Order {
    switch (Int.compare(p1.createdAt, p2.createdAt)) {
      case (#less) { #greater };
      case (#greater) { #less };
      case (#equal) { #equal };
    };
  };

  type PostComment = {
    id : Nat;
    postId : Nat;
    authorId : Nat;
    authorName : Text;
    text : Text;
    createdAt : Int;
  };

  var nextUserId = 1;
  var nextPostId = 1;
  var nextCommentId = 1;

  let socialUsers = Map.empty<Nat, SocialUser>();
  let usersByUsername = Map.empty<Text, Nat>();
  let usersByEmail = Map.empty<Text, Nat>();

  let posts = Map.empty<Nat, Post>();
  let postLikes = Map.empty<Text, Bool>();
  let postLikeCounts = Map.empty<Nat, Nat>();
  let postComments = Map.empty<Nat, PostComment>();

  // ─── New Types ───────────────────────────────────────────────────

  type FriendRequest = {
    id : Nat;
    fromUserId : Nat;
    toUserId : Nat;
    status : { #pending; #accepted; #rejected };
    createdAt : Int;
  };

  type Badge = {
    id : Nat;
    userId : Nat;
    badgeType : Text;
    color : Text;
    awardedBy : Text;
    reason : Text;
    awardedAt : Int;
  };

  type Notification = {
    id : Nat;
    userId : Nat;
    notifType : Text;
    message : Text;
    relatedId : ?Nat;
    isRead : Bool;
    createdAt : Int;
  };

  type DailyQuestion = {
    id : Nat;
    question : Text;
    date : Text;
    postedBy : Text;
    createdAt : Int;
  };

  type DailyAnswer = {
    id : Nat;
    questionId : Nat;
    userId : Nat;
    username : Text;
    answer : Text;
    createdAt : Int;
  };

  var nextFriendRequestId = 1;
  var nextBadgeId = 1;
  var nextNotifId = 1;
  var nextQuestionId = 1;
  var nextAnswerId = 1;

  let friendRequests = Map.empty<Nat, FriendRequest>();
  let badges = Map.empty<Nat, Badge>();
  let notifications = Map.empty<Nat, Notification>();
  let dailyQuestions = Map.empty<Nat, DailyQuestion>();
  let dailyAnswers = Map.empty<Nat, DailyAnswer>();

  // ─── User Profile (for access control system) ─────────────────────────────

  public type UserProfile = {
    socialUserId : ?Nat;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // ─── Profile Methods ─────────────────────────────────────────────

  public shared ({ caller }) func createProfile(name : Text, country : Text, photoUrl : Text, bio : Text, email : ?Text, socialMedia : ?Text) : async Nat {
    if (name == "") Runtime.trap("Name is required");
    if (country == "") Runtime.trap("Country is required");
    let profile : Profile = {
      id = nextId;
      name; country; photoUrl; bio; email; socialMedia;
      createdAt = Int.fromNat(nextId);
    };
    profiles.add(nextId, profile);
    nextId += 1;
    profile.id;
  };

  public shared ({ caller }) func updateProfile(id : Nat, name : Text, country : Text, photoUrl : Text, bio : Text, email : ?Text, socialMedia : ?Text) : async () {
    let existing = switch (profiles.get(id)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?e) { e };
    };
    profiles.add(id, { id; name; country; photoUrl; bio; email; socialMedia; createdAt = existing.createdAt });
  };

  public shared ({ caller }) func deleteProfile(id : Nat) : async () {
    if (not profiles.containsKey(id)) Runtime.trap("Profile does not exist");
    profiles.remove(id);
    likeCounts.remove(id);
  };

  public query ({ caller }) func getProfiles() : async [Profile] {
    profiles.values().toArray().sort();
  };

  public query ({ caller }) func getProfile(id : Nat) : async Profile {
    switch (profiles.get(id)) {
      case (null) Runtime.trap("Profile does not exist");
      case (?p) { p };
    };
  };

  public query ({ caller }) func searchProfiles(searchTerm : Text) : async [Profile] {
    let lower = searchTerm.toLower();
    profiles.values().toArray().filter(func(p) {
      p.name.toLower().contains(#text(lower)) or p.country.toLower().contains(#text(lower));
    }).sort();
  };

  public query ({ caller }) func getProfilesByCountry(country : Text) : async [Profile] {
    let lower = country.toLower();
    profiles.values().toArray().filter(func(p) {
      p.country.toLower().contains(#text(lower));
    }).sort();
  };

  public query ({ caller }) func getCountries() : async [(Text, Nat)] {
    let countries = profiles.values().toArray().values().foldLeft(
      Map.empty<Text, Nat>(),
      func(map, p) {
        let c = switch (map.get(p.country)) { case (null) 0; case (?n) { n } };
        map.add(p.country, c + 1);
        map;
      },
    );
    countries.toArray().sort(compareCountryTuple);
  };

  public shared ({ caller }) func addReview(profileId : Nat, authorName : Text, rating : Nat, comment : Text) : async Nat {
    if (rating < 1 or rating > 5) Runtime.trap("Rating must be between 1 and 5");
    switch (profiles.get(profileId)) { case (null) Runtime.trap("Profile does not exist"); case (?_) {} };
    let review : Review = { id = nextReviewId; profileId; authorName; rating; comment; createdAt = Int.fromNat(nextReviewId) };
    reviews.add(nextReviewId, review);
    nextReviewId += 1;
    review.id;
  };

  public query ({ caller }) func getReviews(profileId : Nat) : async [Review] {
    reviews.values().toArray().filter(func(r) { r.profileId == profileId });
  };

  public query ({ caller }) func getAverageRating(profileId : Nat) : async ?Float {
    let rs = reviews.values().toArray().filter(func(r) { r.profileId == profileId });
    let count = rs.size();
    if (count == 0) return null;
    let sum = rs.foldLeft(0, func(acc, r) { acc + r.rating });
    ?(sum.toFloat() / count.toFloat());
  };

  public shared ({ caller }) func likeProfile(profileId : Nat) : async () {
    if (not profiles.containsKey(profileId)) Runtime.trap("Profile does not exist");
    let c = switch (likeCounts.get(profileId)) { case (null) 0; case (?n) { n } };
    likeCounts.add(profileId, c + 1);
  };

  public query ({ caller }) func getLikeCount(profileId : Nat) : async Nat {
    switch (likeCounts.get(profileId)) { case (null) 0; case (?n) { n } };
  };

  // ─── Social: User Auth ────────────────────────────────────────────────────

  public shared ({ caller }) func registerUser(username : Text, passwordHash : Text, displayName : Text, email : Text, country : Text, bio : Text, avatarUrl : Text) : async Nat {
    if (usersByUsername.containsKey(username)) Runtime.trap("Username already taken");
    if (usersByEmail.containsKey(email)) Runtime.trap("Email already registered");
    let user : SocialUser = {
      id = nextUserId;
      username; passwordHash; displayName; email; country; bio; avatarUrl;
      userType = "member";
      stageName = null;
      portfolioLink = null;
      activityScore = 0;
      createdAt = Int.fromNat(nextUserId);
      isVerified = false;
    };
    socialUsers.add(nextUserId, user);
    usersByUsername.add(username, nextUserId);
    usersByEmail.add(email, nextUserId);
    nextUserId += 1;
    user.id;
  };

  public query ({ caller }) func loginUser(username : Text, passwordHash : Text) : async ?Nat {
    switch (usersByUsername.get(username)) {
      case (null) { null };
      case (?uid) {
        switch (socialUsers.get(uid)) {
          case (null) { null };
          case (?u) {
            if (u.passwordHash == passwordHash) { ?uid } else {
              null;
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getSocialUser(userId : Nat) : async SocialUser {
    switch (socialUsers.get(userId)) {
      case (null) Runtime.trap("User does not exist");
      case (?u) { u };
    };
  };

  public shared ({ caller }) func updateSocialUser(userId : Nat, displayName : Text, email : Text, country : Text, bio : Text, avatarUrl : Text, userType : Text, stageName : ?Text, portfolioLink : ?Text) : async () {
    let existing = switch (socialUsers.get(userId)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?u) { u };
    };

    if (existing.email != email) {
      if (usersByEmail.containsKey(email)) {
        Runtime.trap("Email already registered");
      };
      usersByEmail.add(email, userId);
    };

    if (not usersByUsername.containsKey(existing.username)) {
      usersByUsername.add(existing.username, userId);
    };

    socialUsers.add(userId, {
      id = userId;
      username = existing.username;
      passwordHash = existing.passwordHash;
      displayName; email; country; bio; avatarUrl; userType; stageName; portfolioLink; createdAt = existing.createdAt; activityScore = existing.activityScore;
      isVerified = existing.isVerified;
    });
  };

  public query ({ caller }) func getAllSocialUsers() : async [SocialUser] {
    socialUsers.values().toArray();
  };

  public shared ({ caller }) func verifyUser(userId : Nat, adminPassword : Text) : async () {
    if (adminPassword != ADMIN_PASSWORD) { Runtime.trap("Incorrect admin password") };
    let existing = switch (socialUsers.get(userId)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?u) { u };
    };
    if (existing.isVerified) { Runtime.trap("User is already verified") };
    let updatedUser = {
      existing with isVerified = true;
    };
    socialUsers.add(userId, updatedUser);

    let notif : Notification = {
      id = nextNotifId;
      userId;
      notifType = "verification";
      message = "Congratulations! You have been verified on World Mosaic! ✓";
      relatedId = null;
      isRead = false;
      createdAt = Int.fromNat(nextNotifId);
    };
    notifications.add(nextNotifId, notif);
    nextNotifId += 1;
  };

  public shared ({ caller }) func revokeVerification(userId : Nat, adminPassword : Text) : async () {
    if (adminPassword != ADMIN_PASSWORD) { Runtime.trap("Incorrect admin password") };
    let existing = switch (socialUsers.get(userId)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?u) { u };
    };
    if (not existing.isVerified) { Runtime.trap("User is not verified") };
    let updatedUser = {
      existing with isVerified = false;
    };
    socialUsers.add(userId, updatedUser);

    let notif : Notification = {
      id = nextNotifId;
      userId;
      notifType = "verification";
      message = "Your verification has been revoked.";
      relatedId = null;
      isRead = false;
      createdAt = Int.fromNat(nextNotifId);
    };
    notifications.add(nextNotifId, notif);
    nextNotifId += 1;
  };

  // ─── Social: Posts ────────────────────────────────────────────────────────

  public shared ({ caller }) func createPost(authorId : Nat, imageUrl : Text, caption : Text) : async Nat {
    if (not socialUsers.containsKey(authorId)) Runtime.trap("User does not exist");
    if (imageUrl == "") Runtime.trap("Image URL is required");
    let post : Post = {
      id = nextPostId;
      authorId; imageUrl; caption;
      createdAt = Int.fromNat(nextPostId);
    };
    posts.add(nextPostId, post);
    nextPostId += 1;
    post.id;
  };

  public query ({ caller }) func getPosts() : async [Post] {
    posts.values().toArray().sort(comparePostsDesc);
  };

  public query ({ caller }) func getPostsByUser(userId : Nat) : async [Post] {
    posts.values().toArray().filter(func(p) { p.authorId == userId }).sort(comparePostsDesc);
  };

  public shared ({ caller }) func deletePost(postId : Nat) : async () {
    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post does not exist") };
      case (?p) { p };
    };
    posts.remove(postId);
    postLikeCounts.remove(postId);
  };

  // ─── Social: Post Likes ───────────────────────────────────────────────────

  public shared ({ caller }) func likePost(postId : Nat, userId : Nat) : async () {
    if (not posts.containsKey(postId)) Runtime.trap("Post does not exist");
    let key = postId.toText() # ":" # userId.toText();
    if (not postLikes.containsKey(key)) {
      postLikes.add(key, true);
      let c = switch (postLikeCounts.get(postId)) { case (null) 0; case (?n) { n } };
      postLikeCounts.add(postId, c + 1);
    };
  };

  public shared ({ caller }) func unlikePost(postId : Nat, userId : Nat) : async () {
    let key = postId.toText() # ":" # userId.toText();
    if (postLikes.containsKey(key)) {
      postLikes.remove(key);
      let c = switch (postLikeCounts.get(postId)) { case (null) 0; case (?n) { n } };
      postLikeCounts.add(postId, Nat.max(0, if (c > 0) { c - 1 } else { 0 }));
    };
  };

  public query ({ caller }) func getPostLikeCount(postId : Nat) : async Nat {
    switch (postLikeCounts.get(postId)) { case (null) 0; case (?n) { n } };
  };

  public query ({ caller }) func hasUserLikedPost(postId : Nat, userId : Nat) : async Bool {
    let key = postId.toText() # ":" # userId.toText();
    postLikes.containsKey(key);
  };

  // ─── Social: Comments ─────────────────────────────────────────────────────

  public shared ({ caller }) func addPostComment(postId : Nat, authorId : Nat, authorName : Text, text : Text) : async Nat {
    if (not posts.containsKey(postId)) Runtime.trap("Post does not exist");
    if (text == "") Runtime.trap("Comment text is required");
    let c : PostComment = {
      id = nextCommentId;
      postId; authorId; authorName; text;
      createdAt = Int.fromNat(nextCommentId);
    };
    postComments.add(nextCommentId, c);
    nextCommentId += 1;
    c.id;
  };

  public query ({ caller }) func getPostComments(postId : Nat) : async [PostComment] {
    postComments.values().toArray().filter(func(c) { c.postId == postId });
  };

  public shared ({ caller }) func deletePostComment(commentId : Nat) : async () {
    if (not postComments.containsKey(commentId)) Runtime.trap("Comment does not exist");
    postComments.remove(commentId);
  };

  // ─── Friend Requests ──────────────────────────────────────────────────────

  public shared ({ caller }) func sendFriendRequest(fromId : Nat, toId : Nat) : async Nat {
    if (fromId == toId) Runtime.trap("Cannot send friend request to self");
    if (await areFriends(fromId, toId)) { Runtime.trap("Already friends") };
    let request : FriendRequest = { id = nextFriendRequestId; fromUserId = fromId; toUserId = toId; status = #pending; createdAt = Int.fromNat(nextFriendRequestId) };
    friendRequests.add(nextFriendRequestId, request);
    nextFriendRequestId += 1;
    request.id;
  };

  public shared ({ caller }) func acceptFriendRequest(requestId : Nat) : async () {
    let existing = switch (friendRequests.get(requestId)) {
      case (null) Runtime.trap("Request does not exist!");
      case (?fr) {
        if (fr.status != #pending) { Runtime.trap("Request already processed") };
        fr;
      };
    };
    friendRequests.add(requestId, {existing with status = #accepted});
  };

  public shared ({ caller }) func rejectFriendRequest(requestId : Nat) : async () {
    let existing = switch (friendRequests.get(requestId)) {
      case (null) Runtime.trap("Request does not exist!");
      case (?fr) {
        if (fr.status != #pending) { Runtime.trap("Request already processed") };
        fr;
      };
    };
    friendRequests.add(requestId, {existing with status = #rejected});
  };

  public query ({ caller }) func getFriendRequestsReceived(userId : Nat) : async [FriendRequest] {
    friendRequests.values().toArray().filter(func(fr) { fr.toUserId == userId });
  };

  public query ({ caller }) func getFriendRequestsSent(userId : Nat) : async [FriendRequest] {
    friendRequests.values().toArray().filter(func(fr) { fr.fromUserId == userId });
  };

  public query ({ caller }) func getFriends(userId : Nat) : async [Nat] {
    let list = List.empty<Nat>();

    friendRequests.toArray().forEach(
      func((_, fr)) {
        switch (fr.status) {
          case (#accepted) {
            if (fr.fromUserId == userId) { list.add(fr.toUserId) };
            if (fr.toUserId == userId) { list.add(fr.fromUserId) };
          };
          case (_) {};
        };
      }
    );
    list.toArray();
  };

  public query ({ caller }) func areFriends(userId1 : Nat, userId2 : Nat) : async Bool {
    friendRequests.values().toArray().any(
      func(fr) {
        fr.status == #accepted and
        (
          (fr.fromUserId == userId1 and fr.toUserId == userId2) or
          (fr.fromUserId == userId2 and fr.toUserId == userId1)
        );
      }
    );
  };

  // ─── Badges ───────────────────────────────────────────────────────────────

  public shared ({ caller }) func awardBadge(userId : Nat, badgeType : Text, color : Text, awardedBy : Text, reason : Text, adminPassword : Text) : async Nat {
    if (adminPassword != ADMIN_PASSWORD) { Runtime.trap("Incorrect admin password") };
    if (not socialUsers.containsKey(userId)) Runtime.trap("User does not exist");
    if (badgeType == "") Runtime.trap("Badge type is required");
    let badge : Badge = {
      id = nextBadgeId;
      userId; badgeType; color; awardedBy; reason;
      awardedAt = Int.fromNat(nextBadgeId);
    };
    badges.add(nextBadgeId, badge);
    nextBadgeId += 1;
    badge.id;
  };

  public query ({ caller }) func getUserBadges(userId : Nat) : async [Badge] {
    badges.values().toArray().filter(func(b) { b.userId == userId });
  };

  public shared ({ caller }) func removeBadge(badgeId : Nat, adminPassword : Text) : async () {
    if (adminPassword != ADMIN_PASSWORD) { Runtime.trap("Incorrect admin password") };
    if (not badges.containsKey(badgeId)) Runtime.trap("Badge does not exist");
    badges.remove(badgeId);
  };

  public query ({ caller }) func getAllBadges() : async [Badge] {
    badges.values().toArray();
  };

  // ─── Notifications ────────────────────────────────────────────────────────

  public shared ({ caller }) func createNotification(userId : Nat, notifType : Text, message : Text, relatedId : ?Nat) : async Nat {
    let notif : Notification = {
      id = nextNotifId;
      userId; notifType; message; relatedId;
      isRead = false;
      createdAt = Int.fromNat(nextNotifId);
    };
    notifications.add(nextNotifId, notif);
    nextNotifId += 1;
    notif.id;
  };

  public query ({ caller }) func getNotifications(userId : Nat) : async [Notification] {
    notifications.values().toArray().filter(func(n) { n.userId == userId });
  };

  public shared ({ caller }) func markNotificationRead(notifId : Nat) : async () {
    let existing = switch (notifications.get(notifId)) {
      case (null) Runtime.trap("Notification does not exist");
      case (?n) { n };
    };
    notifications.add(notifId, {existing with isRead = true});
  };

  public shared ({ caller }) func markAllNotificationsRead(userId : Nat) : async () {
    notifications.keys().toArray().forEach(
      func(key) {
        let notif = notifications.get(key);
        switch (notif) {
          case (null) {};
          case (?n) { if (n.userId == userId and not n.isRead) { notifications.add(key, {n with isRead = true}) } };
        };
      }
    );
  };

  public query ({ caller }) func getUnreadCount(userId : Nat) : async Nat {
    var count = 0;
    notifications.values().toArray().forEach(
      func(n) {
        if (n.userId == userId and not n.isRead) { count += 1 };
      }
    );
    count;
  };

  // ─── Daily Question/Answers ───────────────────────────────────────────────

  public shared ({ caller }) func postDailyQuestion(question : Text, date : Text, postedBy : Text, adminPassword : Text) : async Nat {
    if (adminPassword != ADMIN_PASSWORD) { Runtime.trap("Incorrect admin password") };
    if (question == "") Runtime.trap("Question text is required");
    let q : DailyQuestion = {
      id = nextQuestionId;
      question; date; postedBy;
      createdAt = Int.fromNat(nextQuestionId);
    };
    dailyQuestions.add(nextQuestionId, q);
    nextQuestionId += 1;
    q.id;
  };

  public query ({ caller }) func getTodayQuestion(date : Text) : async ?DailyQuestion {
    dailyQuestions.values().toArray().find(func(q) { q.date == date });
  };

  public shared ({ caller }) func submitDailyAnswer(questionId : Nat, userId : Nat, username : Text, answer : Text) : async Nat {
    if (not dailyQuestions.containsKey(questionId)) Runtime.trap("Question does not exist");
    if (answer == "") Runtime.trap("Answer text is required");
    let a : DailyAnswer = {
      id = nextAnswerId;
      questionId; userId; username; answer;
      createdAt = Int.fromNat(nextAnswerId);
    };
    dailyAnswers.add(nextAnswerId, a);
    nextAnswerId += 1;
    a.id;
  };

  public query ({ caller }) func getDailyAnswers(questionId : Nat) : async [DailyAnswer] {
    dailyAnswers.values().toArray().filter(func(a) { a.questionId == questionId });
  };

  public query ({ caller }) func hasSocialUserAnswered(questionId : Nat, userId : Nat) : async Bool {
    dailyAnswers.values().toArray().any(func(a) { a.questionId == questionId and a.userId == userId });
  };

  // ─── Activity/Ranking ─────────────────────────────────────────────────────

  public shared ({ caller }) func incrementUserActivity(userId : Nat, points : Int, adminPassword : Text) : async () {
    if (adminPassword != ADMIN_PASSWORD) { Runtime.trap("Incorrect admin password") };
    let user = switch (socialUsers.get(userId)) {
      case (null) { Runtime.trap("User does not exist!") };
      case (?u) { u };
    };
    socialUsers.add(userId, {
      user with activityScore = Int.max(0, user.activityScore + points);
    });
  };

  public query ({ caller }) func getLeaderboard() : async [SocialUser] {
    socialUsers.values().toArray().sort(
      func(a, b) {
        Int.compare(b.activityScore, a.activityScore);
      }
    );
  };
};
