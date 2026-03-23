cmake_minimum_required(VERSION 3.15)

project(StudioDSP VERSION 1.0)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(VST3 1.0 REQUIRED)

add_library(StudioDSP SHARED
    StudioDSP.cpp)

target_link_libraries(StudioDSP PRIVATE VST3::vst3_sdk)

set_target_properties(StudioDSP PROPERTIES
    BUNDLE TRUE
    BUNDLE DESTINATION .
    PREFIX "")
