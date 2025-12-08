// User Bottom Tabs
export type UserTabParamList = {
  UserHomeTab: undefined;
  MembershipTab: undefined;
  BookPTTab: undefined;
  UserClassesTab: undefined;
  ProfileTab: undefined;
};

// PT Bottom Tabs
export type PTTabParamList = {
  PTHomeTab: undefined;
  TeachingScheduleTab: undefined;
  PTClassesTab: undefined;
  MembershipTab: undefined;
  ProfileTab: undefined;
};

// Root Stack Navigator
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  UserHome: undefined;
  PTHome: undefined;
  UserTabs: undefined;
  PTTabs: undefined;
  Notifications: undefined;
  LocationsTest: undefined;
  Profile: undefined;
  Settings: undefined;
  // Profile related screens
  PersonalInfo: undefined;
  FitnessProgress: undefined;
  CheckInOutHistory: undefined;
  PaymentHistory: undefined;
  Revenue: undefined;
  ChangePassword: undefined;
  // Membership detail screen
  MembershipDetail: {
    membership?: any;
    package?: any;
    isMyMembership: boolean;
  };
  // VNPay WebView screen
  VNPayWebView: {
    paymentUrl: string;
  };
  // Payment result screens
  PaymentSuccess: undefined;
  PaymentFailed: {
    errorMessage?: string;
  };
};
