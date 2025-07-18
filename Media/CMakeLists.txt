cmake_minimum_required(VERSION 3.5)
project( ASSETS_CUSTOM VERSION 1.0.0 )

# Function to get relative paths
function(get_relative_path input_file input_path output_var)
    file(RELATIVE_PATH relPath "${input_path}" "${input_file}")
    set(${output_var} "${relPath}" PARENT_SCOPE)
endfunction()

# SHADERS

file(GLOB_RECURSE SHADERS_LIST
     "${CMAKE_CURRENT_LIST_DIR}/shaders/*.hlsl"
     "${CMAKE_CURRENT_LIST_DIR}/shaders/*.glsl")

# Organize shaders into source groups to preserve directory structure

foreach(filename IN LISTS SHADERS_LIST)
    get_relative_path(${filename} "${CMAKE_CURRENT_LIST_DIR}/shaders" relative_path)
    string(REGEX REPLACE "[/\\]" "\\\\" group_name "${relative_path}")
    get_filename_component(dir "${group_name}" PATH)
    source_group("${dir}" FILES "${filename}")
endforeach()

add_custom_target( Shaders SOURCES ${SHADERS_LIST} )
set_property(TARGET Shaders PROPERTY FOLDER "MEDIA")

# UI Pages

file(GLOB_RECURSE WEB_LIST
     "${CMAKE_CURRENT_LIST_DIR}/web/*.html"
     "${CMAKE_CURRENT_LIST_DIR}/web/*.css"
     "${CMAKE_CURRENT_LIST_DIR}/web/*.js"
)

foreach(filename IN LISTS WEB_LIST)
    get_relative_path(${filename} "${CMAKE_CURRENT_LIST_DIR}/web" relative_path)
    string(REGEX REPLACE "[/\\]" "\\\\" group_name "${relative_path}")
    get_filename_component(dir "${group_name}" PATH)
    source_group("${dir}" FILES "${filename}")
endforeach()

add_custom_target( WebUI SOURCES ${WEB_LIST} )
set_property(TARGET WebUI PROPERTY FOLDER "MEDIA")

# MAPS

file(GLOB_RECURSE MAP_LIST
     "${CMAKE_CURRENT_LIST_DIR}/maps/*.map"
)

foreach(filename IN LISTS MAP_LIST)
    get_relative_path(${filename} "${CMAKE_CURRENT_LIST_DIR}/maps" relative_path)
    string(REGEX REPLACE "[/\\]" "\\\\" group_name "${relative_path}")
    get_filename_component(dir "${group_name}" PATH)
    source_group("${dir}" FILES "${filename}")
endforeach()

add_custom_target(Maps SOURCES ${MAP_LIST} )
set_property(TARGET Maps PROPERTY FOLDER "MEDIA")