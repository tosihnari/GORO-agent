"""
GORO Analytics MCP Server
GA4 / Search Console のデータを Claude Code から参照できるようにする
"""

import os
import json
import requests
import sys
from datetime import datetime, timedelta

# Python path
sys.path.insert(0, os.path.dirname(__file__))

from mcp.server.fastmcp import FastMCP
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest,
    OrderBy, FilterExpression, Filter, FilterExpressionList,
)
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import google.oauth2.credentials

# --- 設定 ---
CREDENTIALS_DIR = os.path.join(os.path.dirname(__file__), "credentials")
CLIENT_SECRETS = os.path.join(CREDENTIALS_DIR, "client_secrets.json")
CLIENT_SECRETS_ROOT = os.path.join(CREDENTIALS_DIR, "client_secrets_root.json")
TOKEN_FILE = os.path.join(CREDENTIALS_DIR, "token.json")
TOKEN_FILE_ROOT = os.path.join(CREDENTIALS_DIR, "token_root.json")
SCOPES = [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/webmasters.readonly",
]

# GA4 プロパティ一覧  (property_key -> (property_id, label, account))
# account: "goro" or "root"
PROPERTIES = {
    # GOROアカウント
    "goro": ("374023474", "GORO HP", "goro"),
    "photoruction_main": ("349442447", "Photoruction メインサービス", "goro"),
    "photoruction_lp": ("404788504", "Photoruction ServiceLP", "goro"),
    "photoruction_corp": ("350712283", "Photoruction コーポレート", "goro"),
    # rootアカウント
    "root": ("322038979", "root Inc HP", "root"),
    "securesketch_www": ("399337070", "SecureSketCH www", "root"),
    "securesketch_staging": ("314867582", "SecureSketCH staging", "root"),
    "securesketch_nri": ("316282134", "nri-secure & secure-sketch", "root"),
    "securesketch_app": ("317241244", "SecureSketCH app", "root"),
    "aladdin": ("321189458", "アラジンオフィス", "root"),
    "teadrop": ("516786688", "TeaDrop.", "root"),
    "nri_corp": ("258246331", "NRIセキュア コーポレートALL", "root"),
    "nri_sans": ("272843483", "NRIセキュア SANS", "root"),
    "nri_corp_en": ("318759494", "NRIセキュア コーポレート英語", "root"),
    "nri_sans_cross": ("360594181", "NRIセキュア SANSクロスドメイン", "root"),
}

# Search Console サイト一覧  (site_key -> (site_url, account))
SC_SITES = {
    "goro": ("sc-domain:studio-goro.com", "goro"),
    "root": ("sc-domain:ic-root.com", "root"),
}

mcp = FastMCP("goro-analytics")


def get_credentials(account: str = "goro"):
    token_file = TOKEN_FILE_ROOT if account == "root" else TOKEN_FILE
    secrets_file = CLIENT_SECRETS_ROOT if account == "root" else CLIENT_SECRETS
    creds = None
    if os.path.exists(token_file):
        with open(token_file) as f:
            creds = google.oauth2.credentials.Credentials.from_authorized_user_info(
                json.load(f), SCOPES
            )
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(secrets_file, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(token_file, "w") as f:
            f.write(creds.to_json())
    return creds


@mcp.tool()
def ga4_monthly_report(
    property_key: str = "goro",
    start_date: str = "2025-01-01",
    end_date: str = "today",
) -> str:
    """
    GA4の月別レポートを取得する。
    property_key: goro / photoruction_main / photoruction_lp / photoruction_corp
    start_date / end_date: YYYY-MM-DD 形式 または "today" / "30daysAgo" など
    """
    if property_key not in PROPERTIES:
        keys = ", ".join(PROPERTIES.keys())
        return f"property_key が無効です。有効なキー: {keys}"

    prop_id, prop_label, account = PROPERTIES[property_key]
    creds = get_credentials(account)
    client = BetaAnalyticsDataClient(credentials=creds)

    request = RunReportRequest(
        property=f"properties/{prop_id}",
        dimensions=[Dimension(name="yearMonth")],
        metrics=[
            Metric(name="screenPageViews"),
            Metric(name="sessions"),
            Metric(name="totalUsers"),
        ],
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        order_bys=[{"dimension": {"dimension_name": "yearMonth"}}],
    )
    response = client.run_report(request)

    lines = [f"■ {prop_label} (ID: {prop_id}) 月別レポート ({start_date} 〜 {end_date})"]
    lines.append(f"{'月':<8} {'PV':>10} {'セッション':>10} {'ユーザー':>10}")
    lines.append("-" * 44)
    for row in response.rows:
        ym = row.dimension_values[0].value
        pv = int(row.metric_values[0].value)
        sessions = int(row.metric_values[1].value)
        users = int(row.metric_values[2].value)
        lines.append(f"{ym[:4]}/{ym[4:]:<5} {pv:>10,} {sessions:>10,} {users:>10,}")

    return "\n".join(lines)


@mcp.tool()
def ga4_page_report(
    property_key: str = "goro",
    start_date: str = "30daysAgo",
    end_date: str = "today",
    limit: int = 20,
) -> str:
    """
    GA4のページ別PVランキングを取得する。
    property_key: goro / photoruction_main / photoruction_lp / photoruction_corp
    """
    if property_key not in PROPERTIES:
        keys = ", ".join(PROPERTIES.keys())
        return f"property_key が無効です。有効なキー: {keys}"

    prop_id, prop_label, account = PROPERTIES[property_key]
    creds = get_credentials(account)
    client = BetaAnalyticsDataClient(credentials=creds)

    request = RunReportRequest(
        property=f"properties/{prop_id}",
        dimensions=[Dimension(name="pagePath"), Dimension(name="pageTitle")],
        metrics=[Metric(name="screenPageViews"), Metric(name="sessions")],
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        order_bys=[{"metric": {"metric_name": "screenPageViews"}, "desc": True}],
        limit=limit,
    )
    response = client.run_report(request)

    lines = [f"■ {prop_label} ページ別PV TOP{limit} ({start_date} 〜 {end_date})"]
    lines.append(f"{'#':>3} {'パス':<35} {'PV':>8} {'セッション':>10}")
    lines.append("-" * 60)
    for i, row in enumerate(response.rows, 1):
        path = row.dimension_values[0].value[:34]
        pv = int(row.metric_values[0].value)
        sessions = int(row.metric_values[1].value)
        lines.append(f"{i:>3}. {path:<35} {pv:>8,} {sessions:>10,}")

    return "\n".join(lines)


@mcp.tool()
def ga4_column_conversion(
    property_key: str = "goro",
    start_date: str = "2025-01-01",
    end_date: str = "today",
) -> str:
    """
    コラム記事 → お問い合わせ遷移率レポートを取得する（GOROサイト向け）。
    """
    if property_key not in PROPERTIES:
        keys = ", ".join(PROPERTIES.keys())
        return f"property_key が無効です。有効なキー: {keys}"

    prop_id, prop_label, account = PROPERTIES[property_key]
    creds = get_credentials(account)
    client = BetaAnalyticsDataClient(credentials=creds)

    date_range = DateRange(start_date=start_date, end_date=end_date)

    col_req = RunReportRequest(
        property=f"properties/{prop_id}",
        dimensions=[Dimension(name="pagePath")],
        metrics=[Metric(name="sessions")],
        date_ranges=[date_range],
        dimension_filter=FilterExpression(
            filter=Filter(
                field_name="pagePath",
                string_filter=Filter.StringFilter(
                    match_type=Filter.StringFilter.MatchType.BEGINS_WITH,
                    value="/column/",
                ),
            )
        ),
        limit=200,
    )
    col_resp = client.run_report(col_req)
    total_column_sessions = sum(int(r.metric_values[0].value) for r in col_resp.rows)

    contact_req = RunReportRequest(
        property=f"properties/{prop_id}",
        dimensions=[Dimension(name="pageReferrer")],
        metrics=[Metric(name="screenPageViews")],
        date_ranges=[date_range],
        dimension_filter=FilterExpression(
            and_group=FilterExpressionList(
                expressions=[
                    FilterExpression(filter=Filter(
                        field_name="pagePath",
                        string_filter=Filter.StringFilter(
                            match_type=Filter.StringFilter.MatchType.EXACT,
                            value="/contact",
                        ),
                    )),
                    FilterExpression(filter=Filter(
                        field_name="pageReferrer",
                        string_filter=Filter.StringFilter(
                            match_type=Filter.StringFilter.MatchType.CONTAINS,
                            value="/column/",
                        ),
                    )),
                ]
            )
        ),
        limit=200,
    )
    contact_resp = client.run_report(contact_req)
    column_to_contact = sum(int(r.metric_values[0].value) for r in contact_resp.rows)

    thanks_req = RunReportRequest(
        property=f"properties/{prop_id}",
        dimensions=[Dimension(name="pagePath")],
        metrics=[Metric(name="sessions")],
        date_ranges=[date_range],
        dimension_filter=FilterExpression(filter=Filter(
            field_name="pagePath",
            string_filter=Filter.StringFilter(
                match_type=Filter.StringFilter.MatchType.EXACT,
                value="/thanks",
            ),
        )),
    )
    thanks_resp = client.run_report(thanks_req)
    total_thanks = sum(int(r.metric_values[0].value) for r in thanks_resp.rows)

    contact_rate = (column_to_contact / total_column_sessions * 100) if total_column_sessions else 0

    lines = [
        f"■ コラム → お問い合わせ遷移率 ({start_date} 〜 {end_date})",
        "=" * 50,
        f"  コラムページ 総セッション数 : {total_column_sessions:>8,}",
        f"  コラム → /contact 直接遷移  : {column_to_contact:>8,}",
        f"  /thanks (全CV完了数)         : {total_thanks:>8,}",
        "-" * 50,
        f"  コラム → お問い合わせ遷移率 : {contact_rate:>7.2f}%",
        "",
        "  ※ 遷移率 = コラムから直接/contactへ移動した回数 / コラム総セッション",
    ]
    return "\n".join(lines)


@mcp.tool()
def search_console_keywords(
    site_key: str = "goro",
    start_date: str = "2025-01-01",
    end_date: str = "today",
    limit: int = 20,
    dimension: str = "query",
) -> str:
    """
    Search Console のキーワード/ページ別データを取得する。
    site_key: goro
    dimension: query（キーワード）/ page（ページ別）/ date（日別）
    end_date: YYYY-MM-DD 形式（"today" は自動で昨日に変換）
    """
    if site_key not in SC_SITES:
        keys = ", ".join(SC_SITES.keys())
        return f"site_key が無効です。有効なキー: {keys}"

    # Search Console API は "today" を受け付けないので昨日に変換
    if end_date == "today":
        end_date = (datetime.today() - timedelta(days=1)).strftime("%Y-%m-%d")

    site_url, account = SC_SITES[site_key]
    creds = get_credentials(account)
    token = creds.token

    url = (
        f"https://www.googleapis.com/webmasters/v3/sites/"
        f"{requests.utils.quote(site_url, safe='')}/searchAnalytics/query"
    )
    payload = {
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": [dimension],
        "rowLimit": limit,
        "orderBy": [{"fieldName": "clicks", "sortOrder": "DESCENDING"}],
    }
    resp = requests.post(url, json=payload, headers={"Authorization": f"Bearer {token}"})
    data = resp.json()

    if "rows" not in data:
        return f"データなし。レスポンス: {json.dumps(data, ensure_ascii=False)}"

    dim_label = {"query": "キーワード", "page": "ページ", "date": "日付"}.get(dimension, dimension)
    lines = [
        f"■ Search Console {dim_label}別 TOP{limit} ({start_date} 〜 {end_date})",
        f"{'#':>3} {dim_label:<35} {'クリック':>8} {'表示回数':>8} {'CTR':>6} {'掲載順位':>8}",
        "-" * 70,
    ]
    for i, row in enumerate(data["rows"], 1):
        key = row["keys"][0][:34]
        clicks = int(row["clicks"])
        impressions = int(row["impressions"])
        ctr = f"{row['ctr']*100:.1f}%"
        position = f"{row['position']:.1f}"
        lines.append(f"{i:>3}. {key:<35} {clicks:>8,} {impressions:>8,} {ctr:>6} {position:>8}")

    return "\n".join(lines)


@mcp.tool()
def list_ga4_properties() -> str:
    """利用可能なGA4プロパティ一覧を表示する。"""
    lines = ["■ 利用可能な GA4 プロパティ"]
    for key, (prop_id, label, account) in PROPERTIES.items():
        token_ok = os.path.exists(TOKEN_FILE_ROOT if account == "root" else TOKEN_FILE)
        status = "✓" if token_ok else "要認証"
        lines.append(f"  {key:<25} → {label} (ID: {prop_id})  [{status}]")
    lines.append("\n■ 利用可能な Search Console サイト")
    for key, (site, account) in SC_SITES.items():
        lines.append(f"  {key:<25} → {site}")
    return "\n".join(lines)


if __name__ == "__main__":
    mcp.run()
