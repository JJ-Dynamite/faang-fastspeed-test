use axum::{
    routing::{get, post},
    Router,
    Json,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
    version: String,
}

#[derive(Serialize)]
struct ApiResponse<T: Serialize> {
    success: bool,
    data: Option<T>,
    error: Option<String>,
}

#[derive(Serialize)]
struct SpeedResult {
    download_mbps: f32,
    upload_mbps: f32,
    ping_ms: u32,
    jitter_ms: f32,
    server_location: String,
    isp: String,
    test_duration_seconds: u32,
    timestamp: String,
}

#[derive(Serialize)]
struct SpeedHistory {
    test_id: String,
    download: f32,
    upload: f32,
    ping: u32,
    timestamp: String,
}

async fn health_check() -> impl IntoResponse {
    Json(HealthResponse {
        status: "healthy".to_string(),
        service: "Check your internet speed".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

async fn root() -> impl IntoResponse {
    Json(ApiResponse::<()> {
        success: true,
        data: None,
        error: None,
    })
}

async fn run_speed_test() -> impl IntoResponse {
    let result = SpeedResult {
        download_mbps: 94.5,
        upload_mbps: 23.8,
        ping_ms: 12,
        jitter_ms: 2.3,
        server_location: "New York, NY".to_string(),
        isp: "Example ISP".to_string(),
        test_duration_seconds: 30,
        timestamp: chrono::Utc::now().to_rfc3339(),
    };

    Json(ApiResponse {
        success: true,
        data: Some(result),
        error: None,
    })
}

async fn get_history() -> impl IntoResponse {
    let history = vec![
        SpeedHistory {
            test_id: "test-001".to_string(),
            download: 94.5,
            upload: 23.8,
            ping: 12,
            timestamp: chrono::Utc::now().to_rfc3339(),
        },
        SpeedHistory {
            test_id: "test-002".to_string(),
            download: 89.2,
            upload: 22.1,
            ping: 15,
            timestamp: chrono::Utc::now().to_rfc3339(),
        },
    ];

    Json(ApiResponse {
        success: true,
        data: Some(history),
        error: None,
    })
}

async fn get_servers() -> impl IntoResponse {
    let servers = vec![
        serde_json::json!({ "name": "New York", "distance_km": 0, "ping_ms": 12 }),
        serde_json::json!({ "name": "Los Angeles", "distance_km": 3944, "ping_ms": 45 }),
        serde_json::json!({ "name": "London", "distance_km": 5570, "ping_ms": 78 }),
    ];

    Json(ApiResponse {
        success: true,
        data: Some(servers),
        error: None,
    })
}

async fn get_stats() -> impl IntoResponse {
    Json(ApiResponse {
        success: true,
        data: Some(serde_json::json!({
            "total_tests": 2345678,
            "avg_download_mbps": 85.6,
            "avg_upload_mbps": 21.3,
            "avg_ping_ms": 18
        })),
        error: None,
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health_check))
        .route("/api/test", post(run_speed_test))
        .route("/api/history", get(get_history))
        .route("/api/servers", get(get_servers))
        .route("/api/stats", get(get_stats))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .unwrap();

    tracing::info!("Check your internet speed backend running on port 3001");
    axum::serve(listener, app).await.unwrap();
}
