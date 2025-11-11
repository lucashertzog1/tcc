import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: 'Preencha todos os campos!' }, { status: 400 });
    }

    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado!' }, { status: 400 });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: 'Senha incorreta!' }, { status: 400 });
    }

    // Retorna dados do usuário (sem a senha)
    return NextResponse.json({
      success: true,
      user: { id: user.id, login: user.login, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
  }
}
