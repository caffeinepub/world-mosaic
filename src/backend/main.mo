import Map "mo:core/Map";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Char "mo:core/Char";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  // Integrate authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Profile = {
    id : Nat;
    name : Text;
    country : Text;
    photoUrl : Text;
    bio : Text;
    email : Text;
    socialMedia : ?Text;
    createdAt : Int;
  };

  module Profile {
    public func compare(profile1 : Profile, profile2 : Profile) : Order.Order {
      Nat.compare(profile1.id, profile2.id);
    };
  };

  module CountryUtil {
    public func compare(tuple1 : (Text, Nat), tuple2 : (Text, Nat)) : Order.Order {
      switch (Nat.compare(tuple1.1, tuple2.1)) {
        case (#equal) { Text.compare(tuple1.0, tuple2.0) };
        case (order) { order };
      };
    };
  };

  var nextId = 1;
  let profiles = Map.empty<Nat, Profile>();

  // Create profile (open access - controlled by frontend password gate)
  public shared func createProfile(name : Text, country : Text, photoUrl : Text, bio : Text, email : Text, socialMedia : ?Text) : async Nat {
    let profile : Profile = {
      id = nextId;
      name;
      country;
      photoUrl;
      bio;
      email;
      socialMedia;
      createdAt = Int.fromNat(0);
    };
    profiles.add(nextId, profile);
    nextId += 1;
    profile.id;
  };

  // Update profile (open access - controlled by frontend password gate)
  public shared func updateProfile(id : Nat, name : Text, country : Text, photoUrl : Text, bio : Text, email : Text, socialMedia : ?Text) : async () {
    let existing = switch (profiles.get(id)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?existing) { existing };
    };

    let updated : Profile = {
      id;
      name;
      country;
      photoUrl;
      bio;
      email;
      socialMedia;
      createdAt = existing.createdAt;
    };
    profiles.add(id, updated);
  };

  // Delete profile (open access - controlled by frontend password gate)
  public shared func deleteProfile(id : Nat) : async () {
    if (not profiles.containsKey(id)) {
      Runtime.trap("Profile does not exist");
    };
    profiles.remove(id);
  };

  // Get all profiles
  public query func getProfiles() : async [Profile] {
    profiles.values().toArray().sort();
  };

  // Get profile by id
  public query func getProfile(id : Nat) : async Profile {
    switch (profiles.get(id)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?profile) { profile };
    };
  };

  // Search profiles by name or country
  public query func searchProfiles(searchTerm : Text) : async [Profile] {
    let lowerTerm = searchTerm.toLower();
    let matches = profiles.values().toArray().filter(
      func(p) {
        p.name.toLower().contains(#text(lowerTerm)) or p.country.toLower().contains(#text(lowerTerm));
      }
    );
    matches.sort();
  };

  // Get profiles by country
  public query func getProfilesByCountry(country : Text) : async [Profile] {
    let lowerCountry = country.toLower();
    let matches = profiles.values().toArray().filter(
      func(p) {
        p.country.toLower().contains(#text(lowerCountry));
      }
    );
    matches.sort();
  };

  // Get distinct list of countries with counts
  public query func getCountries() : async [(Text, Nat)] {
    let iter = profiles.values().toArray().values();
    let countries = iter.foldLeft(
      Map.empty<Text, Nat>(),
      func(map, p) {
        let currentCount = switch (map.get(p.country)) {
          case (null) { 0 };
          case (?count) { count };
        };
        map.add(p.country, currentCount + 1);
        map;
      },
    );
    let result = countries.toArray();
    result.sort();
  };
};
