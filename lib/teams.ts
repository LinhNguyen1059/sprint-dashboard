export const MEMBER_ROLE = {
  DEV: "Developer",
  DESIGNER: "Designer",
  PM: "PM",
  TESTER: "Tester",
  OTHER: "Other"
};

export const TEAMS = [
  {
    name: "CMS",
    members: [
      { name: "Anh Huynh", role: MEMBER_ROLE.DEV },
      { name: "Triet Nguyen", role: MEMBER_ROLE.DEV },
      { name: "Duc Pham", role: MEMBER_ROLE.DEV },
      { name: "Tung Le", role: MEMBER_ROLE.DEV },
      { name: "Nhan Duc Bui", role: MEMBER_ROLE.DEV },
      { name: "Huy Vo", role: MEMBER_ROLE.DEV },
      { name: "Duc Truong", role: MEMBER_ROLE.DEV },
      { name: "Phuoc Vo", role: MEMBER_ROLE.DEV },
      { name: "Viet Pham", role: MEMBER_ROLE.DEV },
      { name: "Thang Nguyen", role: MEMBER_ROLE.DEV },
      { name: "Hieu Nguyen", role: MEMBER_ROLE.DEV },
      { name: "Dong Phung", role: MEMBER_ROLE.DEV },
      { name: "Linh Nguyen Truong", role: MEMBER_ROLE.DEV },
      { name: "Bach Pham", role: MEMBER_ROLE.DEV },
      { name: "Mien Pham", role: MEMBER_ROLE.DEV },
      { name: "Dung Tran", role: MEMBER_ROLE.PM }
    ]
  },
  {
    name: "PRO",
    members: [
      { name: "Thang Do", role: MEMBER_ROLE.DEV },
      { name: "Ly Nguyen", role: MEMBER_ROLE.DEV },
      { name: "Van Nguyen", role: MEMBER_ROLE.DEV },
      { name: "Quang Lê", role: MEMBER_ROLE.DEV },
      { name: "Nhut Do", role: MEMBER_ROLE.DEV },
      { name: "HNghia Nguyen", role: MEMBER_ROLE.DEV },
      { name: "Minh Ha", role: MEMBER_ROLE.DEV },
      { name: "Nghia Nguyen", role: MEMBER_ROLE.DEV },
      { name: "Dung Nguyen", role: MEMBER_ROLE.DEV }
    ]
  },
  {
    name: "WEB",
    members: [
      { name: "Hung Le", role: MEMBER_ROLE.DEV },
      { name: "Thanh Thao", role: MEMBER_ROLE.DEV },
      { name: "Minh Bui", role: MEMBER_ROLE.DEV }
    ]
  },
  {
    name: "ERP",
    members: [
      { name: "Dung Thai", role: MEMBER_ROLE.DEV },
      { name: "Hoa Nguyen", role: MEMBER_ROLE.DEV },
      { name: "Huynh Do", role: MEMBER_ROLE.DEV },
      { name: "Hieu Khau", role: MEMBER_ROLE.DEV }
    ]
  },
  {
    name: "i3Website",
    members: [
      { name: "Huy Nguyen", role: MEMBER_ROLE.DESIGNER },
      { name: "Loc Pham", role: MEMBER_ROLE.DESIGNER },
      { name: "Hien Bui", role: MEMBER_ROLE.DEV },
      { name: "Kieu Nguyen", role: MEMBER_ROLE.DEV }
    ]
  },
  {
    name: "Data Mining",
    members: [
      { name: "Hoa Phan", role: MEMBER_ROLE.OTHER },
      { name: "Thinh Thai", role: MEMBER_ROLE.OTHER }
    ]
  },
  {
    name: "TESTER",
    members: [
      { name: "Phuong Thanh", role: MEMBER_ROLE.TESTER },
      { name: "Han Le", role: MEMBER_ROLE.TESTER },
      { name: "Nguyen Cao", role: MEMBER_ROLE.TESTER },
      { name: "Thuong Nguyen", role: MEMBER_ROLE.TESTER },
      { name: "Lan Le", role: MEMBER_ROLE.TESTER },
      { name: "Danh Nguyen", role: MEMBER_ROLE.TESTER },
      { name: "Tam Vo", role: MEMBER_ROLE.TESTER },
      { name: "Thuy Tran", role: MEMBER_ROLE.TESTER },
      { name: "Hoa Tran", role: MEMBER_ROLE.TESTER },
      { name: "Vy Tran", role: MEMBER_ROLE.TESTER },
      { name: "Ngan Nguyen", role: MEMBER_ROLE.TESTER },
      { name: "Thanh Bui", role: MEMBER_ROLE.TESTER },
      { name: "Vu Pham", role: MEMBER_ROLE.TESTER },
      { name: "Nhung Nguyen", role: MEMBER_ROLE.TESTER },
      { name: "Khoa Hoang", role: MEMBER_ROLE.TESTER },
      { name: "Thi Thanh Nguyen", role: MEMBER_ROLE.TESTER },
      { name: "Tran Nguyen", role: MEMBER_ROLE.TESTER }
    ]
  }
];

export const getMembers = () => TEAMS.flatMap((team) => team.members).filter((member) => member.name !== "Dung Tran");

export const getDevelopers = () =>
  TEAMS.filter((team) => team.name !== "TESTER" && team.name !== "Data Mining")
    .flatMap((team) => team.members)
    .filter((member) => member.role === MEMBER_ROLE.DEV);

export const getMemberRole = (memberName: string) => {
  const member = getMembers().find((member) => member.name === memberName);
  return member ? member.role : MEMBER_ROLE.OTHER;
};
