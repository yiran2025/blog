import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { username, password }: { username: string; password: string } = await request.json();

    const adminUser = process.env.ADMIN_USERNAME || "";
    const adminPass = process.env.ADMIN_PASSWORD || "";

    if (!adminUser || !adminPass) {
      return NextResponse.json(
        { error: "管理员账号未配置" },
        { status: 500 }
      );
    }

    if (username === adminUser && password === adminPass) {
      const session = await getSession();
      session.isLoggedIn = true;
      session.username = username;
      await session.save();

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "用户名或密码错误" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "登录失败" },
      { status: 500 }
    );
  }
}
